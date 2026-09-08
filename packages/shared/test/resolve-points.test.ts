/**
 * The resolver is the only detector-specific code in the project, so it is
 * where a detector's conventions can silently poison every measurement. These
 * tests pin the two things most likely to go wrong: refusing to invent a
 * missing landmark, and not trusting the detector's own left/right naming.
 */
import { describe, expect, it } from 'vitest';

import { point } from '../src/geometry';
import { measureAll } from '../src/measure';
import {
  type FaceContours,
  type FaceLandmarks,
  isDegenerate,
  MissingContourError,
  resolveFrontPoints,
} from '../src/resolve-points';

/** A schematic contour set shaped like a face. Midline at x = 0. */
function contours(): FaceContours {
  return {
    FACE: [
      point(0, -100),
      point(40, -85),
      point(65, -20),
      point(55, 40),
      point(40, 62),
      point(0, 80),
      point(-40, 62),
      point(-55, 40),
      point(-65, -20),
      point(-40, -85),
    ],
    LEFT_EYEBROW_TOP: [point(15, -48), point(30, -52), point(45, -46)],
    RIGHT_EYEBROW_TOP: [point(-15, -48), point(-30, -52), point(-45, -46)],
    LEFT_EYE: [point(15, -30), point(27, -38), point(40, -34), point(27, -22)],
    RIGHT_EYE: [point(-15, -30), point(-27, -38), point(-40, -34), point(-27, -22)],
    NOSE_BRIDGE: [point(0, -30), point(0, 10)],
    NOSE_BOTTOM: [point(-12, 15), point(0, 20), point(12, 15)],
    UPPER_LIP_TOP: [point(-20, 36), point(0, 33), point(20, 36)],
    UPPER_LIP_BOTTOM: [point(-18, 40), point(0, 39), point(18, 40)],
    LOWER_LIP_TOP: [point(-18, 41), point(0, 42), point(18, 41)],
    LOWER_LIP_BOTTOM: [point(-20, 45), point(0, 47), point(20, 45)],
  };
}

function landmarks(): FaceLandmarks {
  return {
    LEFT_EYE: point(27, -30),
    RIGHT_EYE: point(-27, -30),
    LEFT_EAR: point(62, 30),
    RIGHT_EAR: point(-62, 30),
    MOUTH_LEFT: point(22, 40),
    MOUTH_RIGHT: point(-22, 40),
  };
}

/** Mirror every point in x, as if the detector labelled the sides the other way. */
function mirrored<T extends FaceContours | FaceLandmarks>(input: T): T {
  const flip = (p: { x: number; y: number }) => point(-p.x, p.y);
  return Object.fromEntries(
    Object.entries(input).map(([key, value]) => [
      key,
      Array.isArray(value) ? value.map(flip) : flip(value as { x: number; y: number }),
    ]),
  ) as T;
}

describe('resolveFrontPoints', () => {
  it('places the obvious points where they belong', () => {
    const f = resolveFrontPoints(contours(), landmarks());

    expect(f.menton).toEqual(point(0, 80));
    expect(f.foreheadTop).toEqual(point(0, -100));
    expect(f.leftZygion).toEqual(point(65, -20));
    expect(f.rightZygion).toEqual(point(-65, -20));
    expect(f.labialeSuperius).toEqual(point(0, 33));
    expect(f.labialeInferius).toEqual(point(0, 47));
  });

  it('takes the jaw angle from the ear rather than guessing at curvature', () => {
    const f = resolveFrontPoints(contours(), landmarks());
    // The face-oval point nearest each ear landmark.
    expect(f.leftGonion).toEqual(point(55, 40));
    expect(f.rightGonion).toEqual(point(-55, 40));
  });

  it('resolves the eye corners outward and inward, not by detector naming', () => {
    const f = resolveFrontPoints(contours(), landmarks());
    expect(f.leftLateralCanthus.x).toBeGreaterThan(f.leftMedialCanthus.x);
    expect(f.rightLateralCanthus.x).toBeLessThan(f.rightMedialCanthus.x);
  });

  it('produces the same measurements when the detector flips left and right', () => {
    // Detectors disagree about whether "left" is the subject's or the viewer's.
    // A silent disagreement would mirror every asymmetric measurement, so the
    // resolver assigns sides geometrically and this has to hold.
    const asIs = measureAll(resolveFrontPoints(contours(), landmarks()));
    const flipped = measureAll(
      resolveFrontPoints(mirrored(contours()), mirrored(landmarks())),
    );

    for (const [key, value] of Object.entries(asIs)) {
      expect(flipped[key as keyof typeof flipped], key).toBeCloseTo(value as number, 8);
    }
  });

  it('refuses to invent a missing contour', () => {
    const withoutNose: FaceContours = { ...contours(), NOSE_BRIDGE: undefined };
    expect(() => resolveFrontPoints(withoutNose, landmarks())).toThrow(MissingContourError);
  });

  it('refuses a contour that is present but too sparse to use', () => {
    const thinFace: FaceContours = { ...contours(), FACE: [point(0, 0), point(1, 1)] };
    expect(() => resolveFrontPoints(thinFace, landmarks())).toThrow(MissingContourError);
  });

  it('refuses a missing landmark', () => {
    const withoutEar: FaceLandmarks = { ...landmarks(), LEFT_EAR: undefined };
    expect(() => resolveFrontPoints(contours(), withoutEar)).toThrow(MissingContourError);
  });
});

describe('isDegenerate', () => {
  it('accepts a plausible face', () => {
    expect(isDegenerate(resolveFrontPoints(contours(), landmarks()))).toBe(false);
  });

  it('rejects a face whose eyes are wider apart than its cheekbones', () => {
    const f = resolveFrontPoints(contours(), landmarks());
    expect(isDegenerate({ ...f, leftPupil: point(200, -30) })).toBe(true);
  });

  it('rejects a face oval collapsed to a line', () => {
    const f = resolveFrontPoints(contours(), landmarks());
    expect(isDegenerate({ ...f, leftZygion: f.rightZygion })).toBe(true);
  });
});

/**
 * The invariance tests are the point of this file. Reproducibility is the
 * product's only defensible claim, so "the same face measured at a different
 * distance gives the same numbers" is not a nice property — it is the thing
 * being sold, and it is asserted directly.
 */
import { describe, expect, it } from 'vitest';

import { point, type Point } from '../src/geometry';
import { METRIC_META, type MetricKey } from '../src/metrics';
import {
  canthalTilt,
  FRONT_MEASUREMENTS,
  type FrontPoints,
  measureAll,
  PROFILE_MEASUREMENTS,
  type ProfilePoints,
  symmetryIndex,
} from '../src/measure';

/** A schematic, perfectly symmetric face. Midline at x = 0, y grows downward. */
function symmetricFace(canthalRise = 4): FrontPoints {
  return {
    foreheadTop: point(0, -100),
    glabella: point(0, -40),
    nasion: point(0, -30),
    subnasale: point(0, 20),
    menton: point(0, 80),
    leftLateralCanthus: point(40, -30 - canthalRise),
    rightLateralCanthus: point(-40, -30 - canthalRise),
    leftMedialCanthus: point(15, -30),
    rightMedialCanthus: point(-15, -30),
    leftPupil: point(27, -30),
    rightPupil: point(-27, -30),
    leftEyeTop: point(27, -38),
    rightEyeTop: point(-27, -38),
    leftEyeBottom: point(27, -22),
    rightEyeBottom: point(-27, -22),
    leftZygion: point(65, -20),
    rightZygion: point(-65, -20),
    leftGonion: point(55, 40),
    rightGonion: point(-55, 40),
    leftJawMid: point(40, 62),
    rightJawMid: point(-40, 62),
    leftAlare: point(12, 15),
    rightAlare: point(-12, 15),
    leftCheilion: point(22, 40),
    rightCheilion: point(-22, 40),
    labialeSuperius: point(0, 33),
    labialeInferius: point(0, 47),
    stomion: point(0, 40),
  };
}

function profileFace(): ProfilePoints {
  return {
    glabella: point(10, -40),
    nasion: point(8, -30),
    rhinion: point(18, -10),
    pronasale: point(32, 8),
    subnasale: point(14, 20),
    pogonion: point(16, 70),
    menton: point(10, 80),
    gonion: point(-45, 45),
    condylion: point(-52, -20),
    cervicalPoint: point(-20, 95),
  };
}

function mapFace(face: FrontPoints, fn: (p: Point) => Point): FrontPoints {
  return Object.fromEntries(
    Object.entries(face).map(([name, value]) => [name, fn(value)]),
  ) as FrontPoints;
}

describe('catalogue coverage', () => {
  it('implements exactly the geometry metrics and no others', () => {
    const implemented = new Set([
      ...Object.keys(FRONT_MEASUREMENTS),
      ...Object.keys(PROFILE_MEASUREMENTS),
    ]);
    const catalogued = new Set(
      (Object.keys(METRIC_META) as MetricKey[]).filter(
        (key) => METRIC_META[key].provenance === 'geometry',
      ),
    );
    expect([...implemented].sort()).toEqual([...catalogued].sort());
  });
});

describe('symmetry', () => {
  it('scores a symmetric face as perfectly symmetric', () => {
    expect(symmetryIndex(symmetricFace())).toBeCloseTo(1, 10);
  });

  it('drops when one side moves', () => {
    const face = symmetricFace();
    const shifted: FrontPoints = { ...face, leftGonion: point(70, 40) };
    expect(symmetryIndex(shifted)).toBeLessThan(symmetryIndex(face));
  });
});

describe('canthal tilt', () => {
  it('reads positive when the outer corners sit higher', () => {
    const expected = (Math.atan2(4, 25) * 180) / Math.PI;
    expect(canthalTilt(symmetricFace(4))).toBeCloseTo(expected, 10);
  });

  it('is zero for a level eye axis', () => {
    expect(canthalTilt(symmetricFace(0))).toBeCloseTo(0, 10);
  });

  it('reads negative when the outer corners sit lower', () => {
    expect(canthalTilt(symmetricFace(-4))).toBeLessThan(0);
  });
});

describe('invariance', () => {
  it('does not change with distance from the camera', () => {
    // The reproducibility claim in one assertion.
    const near = measureAll(symmetricFace(), profileFace());
    const far = measureAll(mapFace(symmetricFace(), (p) => point(p.x * 2.5, p.y * 2.5)));

    for (const [key, value] of Object.entries(near)) {
      if (key in FRONT_MEASUREMENTS) {
        expect(far[key as MetricKey]).toBeCloseTo(value as number, 8);
      }
    }
  });

  it('does not change with position in the frame', () => {
    const centred = measureAll(symmetricFace());
    const offset = measureAll(mapFace(symmetricFace(), (p) => point(p.x + 320, p.y - 75)));

    for (const [key, value] of Object.entries(centred)) {
      expect(offset[key as MetricKey]).toBeCloseTo(value as number, 8);
    }
  });

  it.each([5, 10, 20, -15])('does not change when the image is rotated by %i degrees', (deg) => {
    // Falls out of the construction: every metric is a ratio of distances, an
    // angle between rays, or a tilt averaged across the left eye and the
    // mirrored right. The capture gate still caps roll, because a real head
    // turning is not a pure in-plane rotation of a flat picture.
    const theta = (deg * Math.PI) / 180;
    const rotate = (p: Point): Point => ({
      x: p.x * Math.cos(theta) - p.y * Math.sin(theta),
      y: p.x * Math.sin(theta) + p.y * Math.cos(theta),
    });

    const upright = measureAll(symmetricFace());
    const turned = measureAll(mapFace(symmetricFace(), rotate));

    for (const [key, value] of Object.entries(upright)) {
      expect(turned[key as MetricKey]).toBeCloseTo(value as number, 8);
    }
  });
});

describe('measureAll', () => {
  it('omits profile metrics on a front-only scan', () => {
    const values = measureAll(symmetricFace());
    expect(Object.keys(values).sort()).toEqual(Object.keys(FRONT_MEASUREMENTS).sort());
  });

  it('adds exactly the profile metrics when a side capture is present', () => {
    const values = measureAll(symmetricFace(), profileFace());
    const expected = [
      ...Object.keys(FRONT_MEASUREMENTS),
      ...Object.keys(PROFILE_MEASUREMENTS),
    ].sort();
    expect(Object.keys(values).sort()).toEqual(expected);
  });

  it('returns a finite number for every metric', () => {
    for (const [key, value] of Object.entries(measureAll(symmetricFace(), profileFace()))) {
      expect(Number.isFinite(value), key).toBe(true);
    }
  });

  it('keeps bounded indices inside their range', () => {
    const values = measureAll(symmetricFace(), profileFace());
    for (const key of [
      'facial_thirds_balance',
      'facial_fifths_balance',
      'jawline_definition',
      'symmetry_index',
      'nasal_dorsum_index',
    ] as const) {
      expect(values[key]).toBeGreaterThan(0);
      expect(values[key]).toBeLessThanOrEqual(1);
    }
  });
});

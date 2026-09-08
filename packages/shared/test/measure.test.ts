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
  symmetryIndex,
} from '../src/measure';
import {
  sampleFrontPoints,
  sampleMeasurements,
  sampleProfilePoints,
} from '../src/sample-face';

const symmetricFace = sampleFrontPoints;
const profileFace = sampleProfilePoints;

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

describe('sampleMeasurements', () => {
  it('covers every front metric', () => {
    const keys = sampleMeasurements().map((m) => m.key);
    expect(keys.sort()).toEqual(Object.keys(FRONT_MEASUREMENTS).sort());
  });

  it('adds the profile metrics on request', () => {
    const keys = sampleMeasurements({ withProfile: true }).map((m) => m.key);
    const expected = [
      ...Object.keys(FRONT_MEASUREMENTS),
      ...Object.keys(PROFILE_MEASUREMENTS),
    ].sort();
    expect(keys.sort()).toEqual(expected);
  });

  it('is computed rather than written down', () => {
    // Guards the reason this fixture exists: numbers typed into a mockup drift
    // away from what the code produces, and these must not be able to.
    const measured = measureAll(sampleFrontPoints());
    for (const { key, value } of sampleMeasurements()) {
      expect(value).toBe(measured[key]);
    }
  });

  it('carries the catalogue unit for each metric', () => {
    for (const { key, unit } of sampleMeasurements({ withProfile: true })) {
      expect(unit).toBe(METRIC_META[key].unit);
    }
  });
});

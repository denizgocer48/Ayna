/**
 * Geometry is the foundation of a reproducible measurement, so it gets exact
 * tests. Every case has an analytically known answer — no fixtures recorded
 * from a previous run, which would only prove the code still does what it used
 * to do.
 */
import { describe, expect, it } from 'vitest';

import {
  angleAt,
  balanceIndex,
  bottommost,
  distance,
  leftmost,
  midpoint,
  nearest,
  point,
  ratio,
  reflectAcross,
  rightmost,
  tilt,
  topmost,
} from '../src/geometry';

describe('distance', () => {
  it('is euclidean', () => {
    expect(distance(point(0, 0), point(3, 4))).toBe(5);
  });
});

describe('angleAt', () => {
  it('measures a right angle', () => {
    expect(angleAt(point(0, 0), point(1, 0), point(0, 1))).toBeCloseTo(90, 10);
  });

  it('measures a straight line', () => {
    expect(angleAt(point(0, 0), point(1, 0), point(-1, 0))).toBeCloseTo(180, 10);
  });

  it('measures an equilateral corner', () => {
    const apex = point(0.5, Math.sqrt(3) / 2);
    expect(angleAt(point(0, 0), point(1, 0), apex)).toBeCloseTo(60, 10);
  });

  it('rejects a degenerate ray', () => {
    expect(() => angleAt(point(0, 0), point(0, 0), point(1, 1))).toThrow();
  });
});

describe('tilt', () => {
  it('signs by the face, not by the image', () => {
    // Image y grows downward, so a point higher on the face has smaller y.
    expect(tilt(point(0, 0), point(1, -1))).toBeCloseTo(45, 10);
    expect(tilt(point(0, 0), point(1, 1))).toBeCloseTo(-45, 10);
    expect(tilt(point(0, 0), point(1, 0))).toBeCloseTo(0, 10);
  });

  it('rejects identical points', () => {
    expect(() => tilt(point(1, 1), point(1, 1))).toThrow();
  });
});

describe('ratio', () => {
  it('rejects a zero denominator', () => {
    expect(() => ratio(1, 0)).toThrow();
  });
});

describe('balanceIndex', () => {
  it('is exactly 1 for equal values', () => {
    expect(balanceIndex([10, 10, 10])).toBeCloseTo(1, 12);
  });

  it('decreases as dispersion grows', () => {
    const even = balanceIndex([10, 10, 10]);
    const slight = balanceIndex([9, 10, 11]);
    const severe = balanceIndex([2, 10, 18]);
    expect(even).toBeGreaterThan(slight);
    expect(slight).toBeGreaterThan(severe);
    expect(severe).toBeGreaterThan(0);
    expect(severe).toBeLessThan(1);
  });

  it('is scale invariant', () => {
    // Doubling every segment describes the same face, larger.
    expect(balanceIndex([9, 10, 11])).toBeCloseTo(balanceIndex([18, 20, 22]), 12);
  });

  it('rejects bad input', () => {
    expect(() => balanceIndex([10])).toThrow();
    expect(() => balanceIndex([10, 0])).toThrow();
  });
});

describe('reflectAcross', () => {
  it('mirrors across a vertical axis', () => {
    const reflected = reflectAcross(point(3, 5), point(0, 0), point(0, 10));
    expect(reflected.x).toBeCloseTo(-3, 12);
    expect(reflected.y).toBeCloseTo(5, 12);
  });

  it('is an involution', () => {
    const axisA = point(1, 0);
    const axisB = point(2, 3);
    const original = point(7, -4);
    const back = reflectAcross(reflectAcross(original, axisA, axisB), axisA, axisB);
    expect(back.x).toBeCloseTo(original.x, 10);
    expect(back.y).toBeCloseTo(original.y, 10);
  });

  it('leaves a point on the axis where it is', () => {
    const same = reflectAcross(point(0, 5), point(0, 0), point(0, 10));
    expect(same.x).toBeCloseTo(0, 12);
    expect(same.y).toBeCloseTo(5, 12);
  });
});

describe('contour helpers', () => {
  const cloud = [point(0, 0), point(5, -3), point(-2, 4), point(9, 1)];

  it('finds extremes, remembering that y grows downward', () => {
    expect(topmost(cloud)).toEqual(point(5, -3));
    expect(bottommost(cloud)).toEqual(point(-2, 4));
    expect(leftmost(cloud)).toEqual(point(-2, 4));
    expect(rightmost(cloud)).toEqual(point(9, 1));
  });

  it('finds the nearest point to a target', () => {
    expect(nearest(cloud, point(8, 2))).toEqual(point(9, 1));
  });

  it('rejects an empty cloud', () => {
    expect(() => topmost([])).toThrow();
    expect(() => nearest([], point(0, 0))).toThrow();
  });
});

describe('midpoint', () => {
  it('averages', () => {
    expect(midpoint(point(0, 0), point(4, 2))).toEqual(point(2, 1));
  });
});

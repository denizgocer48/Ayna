/**
 * Pure 2D geometry over landmark points.
 *
 * Every function is a total function of its arguments: same points in, same
 * number out. That property is the product's central claim, so this module
 * holds no state, no configuration and no randomness.
 *
 * This runs on the device. The photograph and the landmarks derived from it
 * never leave it — see docs/architecture.md.
 */

export type Point = { readonly x: number; readonly y: number };

export function point(x: number, y: number): Point {
  return { x, y };
}

export function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function midpoint(a: Point, b: Point): Point {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

const RADIANS_TO_DEGREES = 180 / Math.PI;

/**
 * Interior angle at `vertex` between the rays to `a` and `b`, in degrees.
 *
 * Throws on a zero-length ray: that means the point set is degenerate, and
 * silently returning an angle would hide it.
 */
export function angleAt(vertex: Point, a: Point, b: Point): number {
  const u = { x: a.x - vertex.x, y: a.y - vertex.y };
  const v = { x: b.x - vertex.x, y: b.y - vertex.y };

  const norms = Math.hypot(u.x, u.y) * Math.hypot(v.x, v.y);
  if (norms === 0) throw new Error('angleAt received a zero-length ray');

  const cosine = (u.x * v.x + u.y * v.y) / norms;
  return Math.acos(Math.max(-1, Math.min(1, cosine))) * RADIANS_TO_DEGREES;
}

/**
 * Signed angle of the segment a->b against horizontal, in degrees.
 *
 * Image coordinates put y downward, so this negates y to give the intuitive
 * sign: positive means b sits higher on the face than a.
 */
export function tilt(a: Point, b: Point): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  if (dx === 0 && dy === 0) throw new Error('tilt received two identical points');
  return Math.atan2(-dy, dx) * RADIANS_TO_DEGREES;
}

/** Guarded division. A zero denominator means a degenerate point set. */
export function ratio(numerator: number, denominator: number): number {
  if (denominator === 0) throw new Error('ratio received a zero denominator');
  return numerator / denominator;
}

/**
 * How equal a set of measurements is, on (0, 1]. Exactly 1 when they are equal.
 *
 * Implemented as 1 / (1 + coefficient of variation) so it is smooth, bounded and
 * needs no clamping — the alternative, 1 - cv, goes negative for very uneven
 * inputs and then has to be clipped, flattening real differences at the bottom.
 */
export function balanceIndex(values: readonly number[]): number {
  if (values.length < 2) throw new Error('balanceIndex needs at least two values');
  if (values.some((value) => value <= 0)) throw new Error('balanceIndex needs positive values');

  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance =
    values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;
  return 1 / (1 + Math.sqrt(variance) / mean);
}

/** Mirror `p` across the line through `axisA` and `axisB`. */
export function reflectAcross(p: Point, axisA: Point, axisB: Point): Point {
  const dx = axisB.x - axisA.x;
  const dy = axisB.y - axisA.y;

  const lengthSquared = dx * dx + dy * dy;
  if (lengthSquared === 0) throw new Error('reflectAcross received a zero-length axis');

  const rx = p.x - axisA.x;
  const ry = p.y - axisA.y;
  const scale = (rx * dx + ry * dy) / lengthSquared;

  return {
    x: axisA.x + 2 * scale * dx - rx,
    y: axisA.y + 2 * scale * dy - ry,
  };
}

/** The point with the smallest y — highest on the face, since y grows downward. */
export function topmost(points: readonly Point[]): Point {
  if (points.length === 0) throw new Error('topmost received no points');
  return points.reduce((best, candidate) => (candidate.y < best.y ? candidate : best));
}

export function bottommost(points: readonly Point[]): Point {
  if (points.length === 0) throw new Error('bottommost received no points');
  return points.reduce((best, candidate) => (candidate.y > best.y ? candidate : best));
}

export function leftmost(points: readonly Point[]): Point {
  if (points.length === 0) throw new Error('leftmost received no points');
  return points.reduce((best, candidate) => (candidate.x < best.x ? candidate : best));
}

export function rightmost(points: readonly Point[]): Point {
  if (points.length === 0) throw new Error('rightmost received no points');
  return points.reduce((best, candidate) => (candidate.x > best.x ? candidate : best));
}

/** The point closest to a target, by Euclidean distance. */
export function nearest(points: readonly Point[], target: Point): Point {
  if (points.length === 0) throw new Error('nearest received no points');
  return points.reduce((best, candidate) =>
    distance(candidate, target) < distance(best, target) ? candidate : best,
  );
}

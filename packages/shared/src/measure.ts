/**
 * Deterministic facial measurements, computed on the device.
 *
 * Every function is pure: the same points in produce the same number out. No
 * randomness, no model inference, no LLM. This is what makes a measurement
 * reproducible across two photos in the same session — the property the
 * incumbents fail on, and the only defensible claim the product has.
 *
 * Units: angles in degrees, everything else a unitless ratio or bounded index.
 * Ratios are normalised against a facial width or height rather than pixels, so
 * a measurement does not change when the user holds the phone closer.
 *
 * Points arrive here already resolved into named anatomical positions. That
 * separation is deliberate and has already paid for itself once: the detector
 * changed from MediaPipe to ML Kit contours without a line of this file moving.
 */

import {
  angleAt,
  balanceIndex,
  distance,
  midpoint,
  type Point,
  ratio,
  reflectAcross,
  tilt,
} from './geometry';
import type { MetricKey } from './metrics';

export type FrontPoints = {
  /**
   * Top of the forehead.
   *
   * NOT the anatomical trichion. No landmark detector locates a hairline
   * reliably — hair covers it and its position varies — so this is the top of
   * the detected face oval, used as a proxy. Any metric derived from it
   * inherits that approximation, which is why `facial_thirds_balance` and
   * `face_length_width_ratio` are read as indicative rather than exact.
   */
  foreheadTop: Point;
  glabella: Point;
  nasion: Point;
  subnasale: Point;
  menton: Point;

  leftLateralCanthus: Point;
  rightLateralCanthus: Point;
  leftMedialCanthus: Point;
  rightMedialCanthus: Point;
  leftPupil: Point;
  rightPupil: Point;
  leftEyeTop: Point;
  rightEyeTop: Point;
  leftEyeBottom: Point;
  rightEyeBottom: Point;

  leftZygion: Point;
  rightZygion: Point;
  leftGonion: Point;
  rightGonion: Point;
  leftJawMid: Point;
  rightJawMid: Point;

  leftAlare: Point;
  rightAlare: Point;
  leftCheilion: Point;
  rightCheilion: Point;
  labialeSuperius: Point;
  labialeInferius: Point;
  stomion: Point;
};

export type ProfilePoints = {
  glabella: Point;
  nasion: Point;
  rhinion: Point;
  pronasale: Point;
  subnasale: Point;
  pogonion: Point;
  menton: Point;
  gonion: Point;
  condylion: Point;
  cervicalPoint: Point;
};

// --- front -------------------------------------------------------------------

/** The reference width most ratios are normalised against. */
export function bizygomaticWidth(f: FrontPoints): number {
  return distance(f.leftZygion, f.rightZygion);
}

/** Mean upward tilt of the eye axis. Positive means the outer corner sits higher. */
export function canthalTilt(f: FrontPoints): number {
  const left = tilt(f.leftMedialCanthus, f.leftLateralCanthus);
  // The right eye runs the other way in x, so measuring medial->lateral there
  // yields an angle near 180 degrees rather than the mirror of the left eye.
  // Traverse it lateral->medial instead, then negate.
  const right = -tilt(f.rightLateralCanthus, f.rightMedialCanthus);
  return (left + right) / 2;
}

export function interpupillaryRatio(f: FrontPoints): number {
  return ratio(distance(f.leftPupil, f.rightPupil), bizygomaticWidth(f));
}

export function eyeAspectRatio(f: FrontPoints): number {
  const left = ratio(
    distance(f.leftEyeTop, f.leftEyeBottom),
    distance(f.leftMedialCanthus, f.leftLateralCanthus),
  );
  const right = ratio(
    distance(f.rightEyeTop, f.rightEyeBottom),
    distance(f.rightMedialCanthus, f.rightLateralCanthus),
  );
  return (left + right) / 2;
}

export function eyeSpacingRatio(f: FrontPoints): number {
  const intercanthal = distance(f.leftMedialCanthus, f.rightMedialCanthus);
  const meanEyeWidth =
    (distance(f.leftMedialCanthus, f.leftLateralCanthus) +
      distance(f.rightMedialCanthus, f.rightLateralCanthus)) /
    2;
  return ratio(intercanthal, meanEyeWidth);
}

export function facialThirdsBalance(f: FrontPoints): number {
  return balanceIndex([
    distance(f.foreheadTop, f.glabella),
    distance(f.glabella, f.subnasale),
    distance(f.subnasale, f.menton),
  ]);
}

export function facialFifthsBalance(f: FrontPoints): number {
  return balanceIndex([
    distance(f.rightZygion, f.rightLateralCanthus),
    distance(f.rightLateralCanthus, f.rightMedialCanthus),
    distance(f.rightMedialCanthus, f.leftMedialCanthus),
    distance(f.leftMedialCanthus, f.leftLateralCanthus),
    distance(f.leftLateralCanthus, f.leftZygion),
  ]);
}

export function fwhr(f: FrontPoints): number {
  return ratio(bizygomaticWidth(f), distance(f.glabella, f.labialeSuperius));
}

export function faceLengthWidthRatio(f: FrontPoints): number {
  return ratio(distance(f.foreheadTop, f.menton), bizygomaticWidth(f));
}

/**
 * Front-view estimate of the jaw angle.
 *
 * An estimate. The jaw angle is three-dimensional and the front view compresses
 * it, which is why `gonial_angle_true` exists and why the jawline group reports
 * `complete: false` without a side capture.
 */
export function gonialAngle(f: FrontPoints): number {
  const left = angleAt(f.leftGonion, f.leftZygion, f.menton);
  const right = angleAt(f.rightGonion, f.rightZygion, f.menton);
  return (left + right) / 2;
}

/**
 * How straight the jaw contour runs from the jaw angle to the chin.
 *
 * A defined jawline reads as a near-straight line from gonion to menton; a
 * softer one bows outward. Measured as the mid-contour point's deviation from
 * that line, normalised by its length, then inverted so higher is more defined.
 */
export function jawlineDefinition(f: FrontPoints): number {
  const side = (gonion: Point, jawMid: Point): number => {
    const chord = distance(gonion, f.menton);
    const deviation = distance(jawMid, midpoint(gonion, f.menton));
    return 1 / (1 + ratio(deviation, chord));
  };
  return (side(f.leftGonion, f.leftJawMid) + side(f.rightGonion, f.rightJawMid)) / 2;
}

export function chinProjectionRatio(f: FrontPoints): number {
  return ratio(distance(f.subnasale, f.menton), distance(f.glabella, f.subnasale));
}

export function mandibleWidthRatio(f: FrontPoints): number {
  return ratio(distance(f.leftGonion, f.rightGonion), bizygomaticWidth(f));
}

export function nasofrontalAngle(f: FrontPoints): number {
  return angleAt(f.nasion, f.glabella, f.subnasale);
}

export function noseWidthRatio(f: FrontPoints): number {
  return ratio(distance(f.leftAlare, f.rightAlare), bizygomaticWidth(f));
}

export function philtrumLengthRatio(f: FrontPoints): number {
  return ratio(distance(f.subnasale, f.labialeSuperius), distance(f.subnasale, f.menton));
}

export function lipFullnessRatio(f: FrontPoints): number {
  return ratio(
    distance(f.labialeSuperius, f.labialeInferius),
    distance(f.leftCheilion, f.rightCheilion),
  );
}

/**
 * How closely the two halves mirror each other, on (0, 1].
 *
 * Each right-side point is reflected across the facial midline and compared to
 * its left-side counterpart. Residuals are normalised by interpupillary distance
 * so the result does not depend on image scale.
 */
export function symmetryIndex(f: FrontPoints): number {
  const axisA = midpoint(f.leftPupil, f.rightPupil);
  const axisB = f.menton;

  const pairs: readonly (readonly [Point, Point])[] = [
    [f.leftLateralCanthus, f.rightLateralCanthus],
    [f.leftMedialCanthus, f.rightMedialCanthus],
    [f.leftZygion, f.rightZygion],
    [f.leftGonion, f.rightGonion],
    [f.leftAlare, f.rightAlare],
    [f.leftCheilion, f.rightCheilion],
  ];

  const scale = distance(f.leftPupil, f.rightPupil);
  const meanResidual =
    pairs.reduce((sum, [left, right]) => sum + distance(left, reflectAcross(right, axisA, axisB)), 0) /
    pairs.length;

  return 1 / (1 + ratio(meanResidual, scale));
}

// --- profile -----------------------------------------------------------------

export function gonialAngleTrue(p: ProfilePoints): number {
  return angleAt(p.gonion, p.condylion, p.menton);
}

export function ramusBodyRatio(p: ProfilePoints): number {
  return ratio(distance(p.condylion, p.gonion), distance(p.gonion, p.menton));
}

export function chinProjectionTrue(p: ProfilePoints): number {
  return ratio(Math.abs(p.pogonion.x - p.nasion.x), distance(p.nasion, p.menton));
}

export function nasofrontalAngleTrue(p: ProfilePoints): number {
  return angleAt(p.nasion, p.glabella, p.pronasale);
}

export function nasalDorsumIndex(p: ProfilePoints): number {
  const chord = distance(p.nasion, p.pronasale);
  const deviation = distance(p.rhinion, midpoint(p.nasion, p.pronasale));
  return 1 / (1 + ratio(deviation, chord));
}

export function submentalCervicalAngle(p: ProfilePoints): number {
  return angleAt(p.cervicalPoint, p.menton, p.gonion);
}

// --- assembly ----------------------------------------------------------------

export const FRONT_MEASUREMENTS = {
  canthal_tilt: canthalTilt,
  interpupillary_ratio: interpupillaryRatio,
  eye_aspect_ratio: eyeAspectRatio,
  eye_spacing_ratio: eyeSpacingRatio,
  facial_thirds_balance: facialThirdsBalance,
  facial_fifths_balance: facialFifthsBalance,
  fwhr,
  face_length_width_ratio: faceLengthWidthRatio,
  gonial_angle: gonialAngle,
  jawline_definition: jawlineDefinition,
  chin_projection_ratio: chinProjectionRatio,
  mandible_width_ratio: mandibleWidthRatio,
  nasofrontal_angle: nasofrontalAngle,
  nose_width_ratio: noseWidthRatio,
  philtrum_length_ratio: philtrumLengthRatio,
  lip_fullness_ratio: lipFullnessRatio,
  symmetry_index: symmetryIndex,
} as const satisfies Partial<Record<MetricKey, (f: FrontPoints) => number>>;

export const PROFILE_MEASUREMENTS = {
  gonial_angle_true: gonialAngleTrue,
  ramus_body_ratio: ramusBodyRatio,
  chin_projection_true: chinProjectionTrue,
  nasofrontal_angle_true: nasofrontalAngleTrue,
  nasal_dorsum_index: nasalDorsumIndex,
  submental_cervical_angle: submentalCervicalAngle,
} as const satisfies Partial<Record<MetricKey, (p: ProfilePoints) => number>>;

/**
 * Every measurable metric for this capture.
 *
 * A front-only scan omits the profile keys rather than estimating them. The
 * progress layer reports the affected group as incomplete, which is honest and,
 * unlike a guess, does not move when the user later adds a side photo.
 */
export function measureAll(
  front: FrontPoints,
  profile?: ProfilePoints,
): Partial<Record<MetricKey, number>> {
  const values: Partial<Record<MetricKey, number>> = {};

  for (const [key, fn] of Object.entries(FRONT_MEASUREMENTS)) {
    values[key as MetricKey] = fn(front);
  }
  if (profile) {
    for (const [key, fn] of Object.entries(PROFILE_MEASUREMENTS)) {
      values[key as MetricKey] = fn(profile);
    }
  }
  return values;
}

/**
 * Turn a face detector's contours into the named anatomical points the
 * measurement layer expects.
 *
 * This is the only detector-specific code in the project. `measure.ts` works
 * from named points and does not know or care what produced them, which is what
 * let the detector change from MediaPipe to ML Kit contours without the
 * arithmetic moving.
 *
 * Kept free of React Native imports so it stays unit-testable: the contour
 * shape is described structurally rather than imported from the camera package.
 */

import {
  bottommost,
  distance,
  leftmost,
  midpoint,
  nearest,
  type Point,
  rightmost,
  topmost,
} from './geometry';
import type { FrontPoints } from './measure';

/** The subset of ML Kit's contour output the resolver needs. */
export type FaceContours = {
  FACE?: Point[];
  LEFT_EYEBROW_TOP?: Point[];
  RIGHT_EYEBROW_TOP?: Point[];
  LEFT_EYE?: Point[];
  RIGHT_EYE?: Point[];
  UPPER_LIP_TOP?: Point[];
  UPPER_LIP_BOTTOM?: Point[];
  LOWER_LIP_TOP?: Point[];
  LOWER_LIP_BOTTOM?: Point[];
  NOSE_BRIDGE?: Point[];
  NOSE_BOTTOM?: Point[];
};

export type FaceLandmarks = {
  LEFT_EYE?: Point;
  RIGHT_EYE?: Point;
  LEFT_EAR?: Point;
  RIGHT_EAR?: Point;
  MOUTH_LEFT?: Point;
  MOUTH_RIGHT?: Point;
};

export class MissingContourError extends Error {
  constructor(readonly contour: string) {
    super(`face detector returned no ${contour} contour`);
    this.name = 'MissingContourError';
  }
}

function require_<T>(value: T | undefined, name: string): T {
  if (value === undefined) throw new MissingContourError(name);
  return value;
}

function requirePoints(points: Point[] | undefined, name: string, minimum = 1): Point[] {
  const value = require_(points, name);
  if (value.length < minimum) throw new MissingContourError(name);
  return value;
}

/**
 * Split a contour into the two halves of the face by x, relative to a midline.
 *
 * Deliberately geometric rather than trusting the detector's own LEFT/RIGHT
 * naming. Detectors disagree about whether "left" means the subject's left or
 * the viewer's, and a silent disagreement would mirror every asymmetric
 * measurement. Every metric here averages a side with its mirror, so a
 * consistent assignment is what matters, not which side gets which label.
 */
function splitByMidline(points: readonly Point[], midlineX: number) {
  return {
    higherX: points.filter((p) => p.x >= midlineX),
    lowerX: points.filter((p) => p.x < midlineX),
  };
}

/**
 * Resolve a front capture.
 *
 * Throws `MissingContourError` rather than substituting a guessed point. A
 * measurement built on an invented landmark is worse than no measurement: it
 * looks valid and cannot be checked.
 */
export function resolveFrontPoints(
  contours: FaceContours,
  landmarks: FaceLandmarks,
): FrontPoints {
  const face = requirePoints(contours.FACE, 'FACE', 8);
  const noseBridge = requirePoints(contours.NOSE_BRIDGE, 'NOSE_BRIDGE', 2);
  const noseBottom = requirePoints(contours.NOSE_BOTTOM, 'NOSE_BOTTOM', 2);
  const upperLipTop = requirePoints(contours.UPPER_LIP_TOP, 'UPPER_LIP_TOP');
  const upperLipBottom = requirePoints(contours.UPPER_LIP_BOTTOM, 'UPPER_LIP_BOTTOM');
  const lowerLipTop = requirePoints(contours.LOWER_LIP_TOP, 'LOWER_LIP_TOP');
  const lowerLipBottom = requirePoints(contours.LOWER_LIP_BOTTOM, 'LOWER_LIP_BOTTOM');
  const browA = requirePoints(contours.LEFT_EYEBROW_TOP, 'LEFT_EYEBROW_TOP', 2);
  const browB = requirePoints(contours.RIGHT_EYEBROW_TOP, 'RIGHT_EYEBROW_TOP', 2);
  const eyeA = requirePoints(contours.LEFT_EYE, 'LEFT_EYE', 4);
  const eyeB = requirePoints(contours.RIGHT_EYE, 'RIGHT_EYE', 4);

  const pupilA = require_(landmarks.LEFT_EYE, 'LEFT_EYE landmark');
  const pupilB = require_(landmarks.RIGHT_EYE, 'RIGHT_EYE landmark');
  const earA = require_(landmarks.LEFT_EAR, 'LEFT_EAR landmark');
  const earB = require_(landmarks.RIGHT_EAR, 'RIGHT_EAR landmark');
  const mouthA = require_(landmarks.MOUTH_LEFT, 'MOUTH_LEFT landmark');
  const mouthB = require_(landmarks.MOUTH_RIGHT, 'MOUTH_RIGHT landmark');

  // The pupils define the midline more reliably than the face oval, which is
  // pulled sideways by hair and by any head turn the gate still allows.
  const midlineX = (pupilA.x + pupilB.x) / 2;
  const isHigherX = (p: Point) => p.x >= midlineX;

  // "left" below means the higher-x side. See splitByMidline.
  const [leftPupil, rightPupil] = isHigherX(pupilA) ? [pupilA, pupilB] : [pupilB, pupilA];
  const [leftEar, rightEar] = isHigherX(earA) ? [earA, earB] : [earB, earA];
  const [leftCheilion, rightCheilion] = isHigherX(mouthA) ? [mouthA, mouthB] : [mouthB, mouthA];
  const [leftEye, rightEye] = isHigherX(eyeA[0]!) ? [eyeA, eyeB] : [eyeB, eyeA];
  const [leftBrow, rightBrow] = isHigherX(browA[0]!) ? [browA, browB] : [browB, browA];

  const menton = bottommost(face);
  const faceSides = splitByMidline(face, midlineX);

  // Gonion is the jaw angle. Approximated as the face-oval point nearest the
  // ear landmark, which is anatomically close and needs no curvature estimate
  // on a sparse contour.
  const leftGonion = nearest(faceSides.higherX, leftEar);
  const rightGonion = nearest(faceSides.lowerX, rightEar);

  return {
    // Top of the detected face oval, used as a forehead proxy. It is not the
    // anatomical trichion — see the note on FrontPoints.
    foreheadTop: topmost(face),
    // Between the brows: the midpoint of their innermost ends.
    glabella: midpoint(leftmost(leftBrow), rightmost(rightBrow)),
    nasion: topmost(noseBridge),
    // The centre of the nose base, taken as the point nearest the midline.
    subnasale: nearest(noseBottom, { x: midlineX, y: bottommost(noseBottom).y }),
    menton,

    leftLateralCanthus: rightmost(leftEye),
    rightLateralCanthus: leftmost(rightEye),
    leftMedialCanthus: leftmost(leftEye),
    rightMedialCanthus: rightmost(rightEye),
    leftPupil,
    rightPupil,
    leftEyeTop: topmost(leftEye),
    rightEyeTop: topmost(rightEye),
    leftEyeBottom: bottommost(leftEye),
    rightEyeBottom: bottommost(rightEye),

    leftZygion: rightmost(face),
    rightZygion: leftmost(face),
    leftGonion,
    rightGonion,
    leftJawMid: nearest(faceSides.higherX, midpoint(leftGonion, menton)),
    rightJawMid: nearest(faceSides.lowerX, midpoint(rightGonion, menton)),

    leftAlare: rightmost(noseBottom),
    rightAlare: leftmost(noseBottom),
    leftCheilion,
    rightCheilion,
    labialeSuperius: topmost(upperLipTop),
    labialeInferius: bottommost(lowerLipBottom),
    stomion: midpoint(bottommost(upperLipBottom), topmost(lowerLipTop)),
  };
}

/**
 * Sanity check on a resolved point set.
 *
 * Catches the case where the detector returned points that are individually
 * plausible but collectively impossible — a face oval collapsed to a line, or
 * eyes resolved to the same point. Cheap, and it fails loudly instead of
 * producing a measurement nobody can interrogate.
 */
export function isDegenerate(f: FrontPoints): boolean {
  const width = distance(f.leftZygion, f.rightZygion);
  const height = distance(f.foreheadTop, f.menton);
  const interpupillary = distance(f.leftPupil, f.rightPupil);

  return width <= 0 || height <= 0 || interpupillary <= 0 || interpupillary >= width;
}

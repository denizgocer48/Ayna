import type { FaceContours, FaceLandmarks, QualitySignals } from '@ayna/shared';

/**
 * The shape of one detected face, as reported by the ML Kit detector.
 *
 * Declared structurally rather than imported so this adapter stays testable and
 * so a detector change is confined to this file and `resolve-points.ts`.
 */
export type DetectedFace = {
  bounds: { x: number; y: number; width: number; height: number };
  frameWidth: number;
  frameHeight: number;
  yawAngle: number;
  pitchAngle: number;
  rollAngle: number;
  leftEyeOpenProbability?: number;
  rightEyeOpenProbability?: number;
  contours?: FaceContours;
  landmarks?: FaceLandmarks;
};

/**
 * Adapt a detector result into the signals the capture gate understands.
 *
 * `brightness` and `sharpness` are null: ML Kit does not report them. The gate
 * skips a check whose signal is missing rather than defaulting it to a passing
 * value, so an unmeasured condition stays visibly unmeasured.
 *
 * TODO(faz-1): measure mean luma and a sharpness proxy from the frame and pass
 * them through. Both matter — the capture guidance asks the user for even light
 * for a reason — and until then the gate is weaker than it reads.
 */
export function toQualitySignals(faces: readonly DetectedFace[]): QualitySignals {
  const face = faces[0];

  if (faces.length !== 1 || !face) {
    return {
      faceCount: faces.length,
      yaw: 0,
      pitch: 0,
      roll: 0,
      faceRatio: 0,
      offCentre: 0,
      eyesOpen: null,
      brightness: null,
      sharpness: null,
    };
  }

  const faceCentreX = face.bounds.x + face.bounds.width / 2;

  return {
    faceCount: 1,
    yaw: face.yawAngle,
    pitch: face.pitchAngle,
    roll: face.rollAngle,
    faceRatio: face.frameHeight > 0 ? face.bounds.height / face.frameHeight : 0,
    offCentre:
      face.frameWidth > 0
        ? Math.abs(faceCentreX - face.frameWidth / 2) / face.frameWidth
        : 0,
    // The stricter of the two eyes: one closed eye is enough to spoil the
    // eye measurements.
    eyesOpen: eyeOpenness(face),
    brightness: null,
    sharpness: null,
  };
}

function eyeOpenness(face: DetectedFace): number | null {
  const left = face.leftEyeOpenProbability;
  const right = face.rightEyeOpenProbability;
  if (left === undefined || right === undefined) return null;
  return Math.min(left, right);
}

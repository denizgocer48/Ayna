import {
  CAPTURE_LIMITS,
  type CaptureIssue,
  type CaptureQuality,
} from '@ayna/shared';

export type QualitySignals = {
  faceCount: number;
  yaw: number;
  pitch: number;
  roll: number;
  faceRatio: number;
  /** Horizontal offset of the face centre from the frame centre, 0-1. */
  offCenter: number;
  brightness: number;
  sharpness: number;
  confidence: number;
};

/**
 * Pure function over one frame's landmark signals. Kept free of camera types so
 * it stays unit-testable — the VisionCamera frame processor adapts into this.
 */
export function evaluateCaptureQuality(signals: QualitySignals): CaptureQuality {
  const issues: CaptureIssue[] = [];

  if (signals.faceCount === 0) issues.push('no_face');
  if (signals.faceCount > 1) issues.push('multiple_faces');

  if (signals.faceRatio < CAPTURE_LIMITS.minFaceRatio) issues.push('face_too_small');
  if (signals.faceRatio > CAPTURE_LIMITS.maxFaceRatio) issues.push('face_too_close');
  if (signals.offCenter > 0.12) issues.push('off_center');

  if (Math.abs(signals.yaw) > CAPTURE_LIMITS.maxYaw) issues.push('head_turned');
  if (
    Math.abs(signals.pitch) > CAPTURE_LIMITS.maxPitch ||
    Math.abs(signals.roll) > CAPTURE_LIMITS.maxRoll
  ) {
    issues.push('head_tilted');
  }

  if (signals.brightness < CAPTURE_LIMITS.minBrightness) issues.push('too_dark');
  if (signals.brightness > CAPTURE_LIMITS.maxBrightness) issues.push('too_bright');
  if (signals.sharpness < CAPTURE_LIMITS.minSharpness) issues.push('blurry');
  if (signals.confidence < CAPTURE_LIMITS.minConfidence) issues.push('low_confidence');

  return {
    ok: issues.length === 0,
    issues,
    yaw: signals.yaw,
    pitch: signals.pitch,
    roll: signals.roll,
    faceRatio: signals.faceRatio,
    brightness: signals.brightness,
    sharpness: signals.sharpness,
    confidence: signals.confidence,
  };
}

/** One actionable sentence per issue, most blocking first. */
export const ISSUE_HINTS: Record<CaptureIssue, string> = {
  no_face: 'No face detected. Center your face in the oval.',
  multiple_faces: 'More than one face in frame. Make sure only you are visible.',
  face_too_small: 'Move closer.',
  face_too_close: 'Move back a little.',
  off_center: 'Center your face in the oval.',
  head_turned: 'Face the camera straight on.',
  head_tilted: 'Level your head.',
  too_dark: 'Find brighter, more even light.',
  too_bright: 'Too much glare. Move away from direct light.',
  blurry: 'Hold still — the frame is blurry.',
  obstructed: 'Move hair and glasses out of the way.',
  low_confidence: 'Detection is unreliable here. Try different lighting.',
};

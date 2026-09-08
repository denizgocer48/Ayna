import { z } from 'zod';

/**
 * Capture-quality gates run on the device before a frame becomes a scan.
 *
 * A bad frame produces a measurement nobody can trust, and an untrustworthy
 * number is the failure the whole product is built to avoid. So this is a hard
 * gate: the shutter stays disabled until it passes.
 */
export const CAPTURE_LIMITS = {
  /** Head rotation, degrees. Beyond this, foreshortening dominates. */
  maxYaw: 8,
  maxPitch: 8,
  maxRoll: 6,
  /** Face bounding box height as a fraction of frame height. */
  minFaceRatio: 0.35,
  maxFaceRatio: 0.8,
  /** Distance of the face centre from the frame centre, as a fraction of width. */
  maxOffCentre: 0.12,
  /** Both eyes must be open — a blink changes the eye measurements. */
  minEyeOpen: 0.6,
  /** Mean luma, 0-1. Only checked when the signal is available. */
  minBrightness: 0.25,
  maxBrightness: 0.9,
  /** Variance-of-Laplacian sharpness floor. Only checked when available. */
  minSharpness: 0.35,
} as const;

export const captureIssueSchema = z.enum([
  'no_face',
  'multiple_faces',
  'face_too_small',
  'face_too_close',
  'off_center',
  'head_turned',
  'head_tilted',
  'eyes_closed',
  'too_dark',
  'too_bright',
  'blurry',
]);
export type CaptureIssue = z.infer<typeof captureIssueSchema>;

/**
 * What the detector reports about one frame.
 *
 * `brightness` and `sharpness` are nullable because the face detector does not
 * measure them. They are checked when a value is supplied and skipped when it is
 * not — rather than defaulted to something passing, which would turn an
 * unmeasured condition into a silent pass. See docs/handoff.md.
 */
export const captureQualitySchema = z.object({
  ok: z.boolean(),
  issues: z.array(captureIssueSchema),
  yaw: z.number(),
  pitch: z.number(),
  roll: z.number(),
  faceRatio: z.number(),
  offCentre: z.number(),
  eyesOpen: z.number().nullable(),
  brightness: z.number().nullable(),
  sharpness: z.number().nullable(),
});
export type CaptureQuality = z.infer<typeof captureQualitySchema>;

export const poseSchema = z.enum(['front', 'side']);
export type Pose = z.infer<typeof poseSchema>;

export type QualitySignals = {
  faceCount: number;
  yaw: number;
  pitch: number;
  roll: number;
  faceRatio: number;
  offCentre: number;
  /** Lower of the two eye-open probabilities, or null if not reported. */
  eyesOpen: number | null;
  brightness: number | null;
  sharpness: number | null;
};

/**
 * Evaluate one frame. Pure, so it is tested directly rather than through a
 * camera.
 *
 * Issues are returned in the order the user should act on them: a missing face
 * has to be fixed before framing, and framing before the fine detail.
 */
export function evaluateCaptureQuality(signals: QualitySignals): CaptureQuality {
  const issues: CaptureIssue[] = [];

  if (signals.faceCount === 0) issues.push('no_face');
  if (signals.faceCount > 1) issues.push('multiple_faces');

  if (signals.faceCount === 1) {
    if (signals.faceRatio < CAPTURE_LIMITS.minFaceRatio) issues.push('face_too_small');
    if (signals.faceRatio > CAPTURE_LIMITS.maxFaceRatio) issues.push('face_too_close');
    if (signals.offCentre > CAPTURE_LIMITS.maxOffCentre) issues.push('off_center');

    if (Math.abs(signals.yaw) > CAPTURE_LIMITS.maxYaw) issues.push('head_turned');
    if (
      Math.abs(signals.pitch) > CAPTURE_LIMITS.maxPitch ||
      Math.abs(signals.roll) > CAPTURE_LIMITS.maxRoll
    ) {
      issues.push('head_tilted');
    }

    if (signals.eyesOpen !== null && signals.eyesOpen < CAPTURE_LIMITS.minEyeOpen) {
      issues.push('eyes_closed');
    }
    if (signals.brightness !== null) {
      if (signals.brightness < CAPTURE_LIMITS.minBrightness) issues.push('too_dark');
      if (signals.brightness > CAPTURE_LIMITS.maxBrightness) issues.push('too_bright');
    }
    if (signals.sharpness !== null && signals.sharpness < CAPTURE_LIMITS.minSharpness) {
      issues.push('blurry');
    }
  }

  return {
    ok: issues.length === 0,
    issues,
    yaw: signals.yaw,
    pitch: signals.pitch,
    roll: signals.roll,
    faceRatio: signals.faceRatio,
    offCentre: signals.offCentre,
    eyesOpen: signals.eyesOpen,
    brightness: signals.brightness,
    sharpness: signals.sharpness,
  };
}

/**
 * The one thing to tell the user right now.
 *
 * Showing every issue at once is paralysing. `issues` is already ordered by what
 * to fix first, so the head of the list is the instruction.
 */
export function primaryIssue(quality: CaptureQuality): CaptureIssue | null {
  return quality.issues[0] ?? null;
}

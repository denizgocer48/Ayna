import { z } from 'zod';

/**
 * Capture-quality gates run on-device before a photo is ever uploaded.
 * A bad frame produces a nonsense score, and a nonsense score loses the user
 * on their first session — so this is a hard gate, not a warning.
 */
export const CAPTURE_LIMITS = {
  /** Head rotation, degrees. Beyond this, landmark depth error dominates. */
  maxYaw: 8,
  maxPitch: 8,
  maxRoll: 6,
  /** Face bounding box height as a fraction of frame height. */
  minFaceRatio: 0.35,
  maxFaceRatio: 0.8,
  /** Mean luma, 0-1. */
  minBrightness: 0.25,
  maxBrightness: 0.9,
  /** Variance-of-Laplacian sharpness floor. */
  minSharpness: 0.35,
  /** Landmark detector confidence. */
  minConfidence: 0.8,
} as const;

export const captureIssueSchema = z.enum([
  'no_face',
  'multiple_faces',
  'face_too_small',
  'face_too_close',
  'off_center',
  'head_turned',
  'head_tilted',
  'too_dark',
  'too_bright',
  'blurry',
  'obstructed',
  'low_confidence',
]);
export type CaptureIssue = z.infer<typeof captureIssueSchema>;

export const captureQualitySchema = z.object({
  ok: z.boolean(),
  issues: z.array(captureIssueSchema),
  yaw: z.number(),
  pitch: z.number(),
  roll: z.number(),
  faceRatio: z.number(),
  brightness: z.number(),
  sharpness: z.number(),
  confidence: z.number(),
});
export type CaptureQuality = z.infer<typeof captureQualitySchema>;

export const poseSchema = z.enum(['front', 'side']);
export type Pose = z.infer<typeof poseSchema>;

import { z } from 'zod';
import { captureQualitySchema, poseSchema } from './capture';
import { measurementSchema, metricChangeSchema, metricGroupSchema } from './metrics';

export const scanStatusSchema = z.enum([
  'pending',
  'processing',
  'complete',
  'failed',
  'rejected_quality',
]);
export type ScanStatus = z.infer<typeof scanStatusSchema>;

export const recommendationSchema = z.object({
  id: z.string(),
  /** The metrics that produced this recommendation — never unattributed advice. */
  drivenBy: z.array(z.string()),
  title: z.string(),
  body: z.string(),
  category: z.enum(['skincare', 'grooming', 'hair', 'posture', 'fitness', 'sleep', 'habits']),
  effort: z.enum(['daily', 'weekly', 'one_off']),
  /** Weeks before a measurable change is realistic. Sets honest expectations. */
  horizonWeeks: z.number().int().positive(),
});
export type Recommendation = z.infer<typeof recommendationSchema>;

/**
 * A capture is its pose and its quality report. There is no image reference,
 * because the image is never sent — measurement happens on the device and only
 * the derived scalars are uploaded. See docs/architecture.md.
 */
export const captureSchema = z.object({
  pose: poseSchema,
  quality: captureQualitySchema,
});
export type Capture = z.infer<typeof captureSchema>;

/**
 * What a group of metrics did between two scans.
 *
 * There is no group score. A single number over a group would need weights, and
 * weights over measurements in different units need a reference distribution to
 * normalise against — the thing `docs/norms.md` says we do not have. Counting
 * what moved is honest and needs nothing.
 */
export const groupProgressSchema = z.object({
  group: metricGroupSchema,
  improved: z.number().int().nonnegative(),
  held: z.number().int().nonnegative(),
  declined: z.number().int().nonnegative(),
  /** False when the scan lacked the pose this group needs. */
  complete: z.boolean(),
});
export type GroupProgress = z.infer<typeof groupProgressSchema>;

export const progressSchema = z.object({
  /** The scan this one is measured against — always the user's first. */
  baselineScanId: z.string().uuid(),
  baselineCapturedAt: z.string().datetime(),
  daysSinceBaseline: z.number().int().nonnegative(),
  changes: z.array(metricChangeSchema),
  byGroup: z.array(groupProgressSchema),
});
export type Progress = z.infer<typeof progressSchema>;

export const scanResultSchema = z.object({
  scanId: z.string().uuid(),
  status: scanStatusSchema,
  capturedAt: z.string().datetime(),
  captures: z.array(captureSchema).min(1).max(2),

  /** Raw measurements. No score, no percentile, no ranking against anyone. */
  measurements: z.array(measurementSchema),

  /** Absent on the first scan — there is nothing yet to measure against. */
  progress: progressSchema.nullable(),

  recommendations: z.array(recommendationSchema),

  /** True when the detail is gated behind the paywall. */
  locked: z.boolean(),
  /** Measurement engine version. Required so an old scan stays comparable. */
  engineVersion: z.string(),
});
export type ScanResult = z.infer<typeof scanResultSchema>;

// --- API contract -----------------------------------------------------------

/**
 * A completed scan, measured on the device.
 *
 * The server receives numbers, never pixels. It stores them, computes progress
 * against the user's baseline, and generates the routine. Nothing queues and
 * nothing polls, because the analysis is already done when this request is made.
 */
export const createScanRequestSchema = z.object({
  /** One entry per captured pose. Front is required; side is optional. */
  captures: z.array(captureSchema).min(1).max(2),
  /** The derived measurements. Not identifying: 23 ratios are not a face. */
  measurements: z.array(measurementSchema).min(1),
});
export type CreateScanRequest = z.infer<typeof createScanRequestSchema>;

export const createScanResponseSchema = z.object({
  scanId: z.string().uuid(),
  status: scanStatusSchema,
  /** Present from the second scan onward. */
  progress: progressSchema.nullable(),
});
export type CreateScanResponse = z.infer<typeof createScanResponseSchema>;

export const apiErrorSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.unknown().optional(),
  }),
});
export type ApiError = z.infer<typeof apiErrorSchema>;

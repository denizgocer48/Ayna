import { z } from 'zod';
import { captureQualitySchema, poseSchema } from './capture';
import { metricGroupSchema, metricResultSchema } from './metrics';

export const scanStatusSchema = z.enum([
  'pending',
  'processing',
  'complete',
  'failed',
  'rejected_quality',
]);
export type ScanStatus = z.infer<typeof scanStatusSchema>;

export const scoreBandSchema = z.enum(['low', 'mid', 'high', 'elite']);
export type ScoreBand = z.infer<typeof scoreBandSchema>;

export const subScoreSchema = z.object({
  group: metricGroupSchema,
  score: z.number().min(0).max(100),
  reachable: z.number().min(0).max(100),
  band: scoreBandSchema,
  /** False when the scan lacked the pose this group needs (side capture skipped). */
  complete: z.boolean(),
});
export type SubScore = z.infer<typeof subScoreSchema>;

export const recommendationSchema = z.object({
  id: z.string(),
  /** The metrics that produced this recommendation — never unattributed advice. */
  drivenBy: z.array(z.string()),
  title: z.string(),
  body: z.string(),
  category: z.enum(['skincare', 'grooming', 'hair', 'posture', 'fitness', 'sleep', 'habits']),
  effort: z.enum(['daily', 'weekly', 'one_off']),
  /** Weeks before a visible change is realistic. Sets honest expectations. */
  horizonWeeks: z.number().int().positive(),
  /** Share of the score gap this item is expected to close, 0-1. */
  expectedImpact: z.number().min(0).max(1),
});
export type Recommendation = z.infer<typeof recommendationSchema>;

export const scanImageSchema = z.object({
  pose: poseSchema,
  quality: captureQualitySchema,
  /** Null once the source object is deleted post-analysis. */
  imagePath: z.string().nullable(),
});
export type ScanImage = z.infer<typeof scanImageSchema>;

export const scanResultSchema = z.object({
  scanId: z.string().uuid(),
  status: scanStatusSchema,
  capturedAt: z.string().datetime(),
  images: z.array(scanImageSchema).min(1).max(2),

  /** Today's score. */
  overall: z.number().min(0).max(100),
  band: scoreBandSchema,
  /**
   * Where the score lands if every non-fixed metric reaches its realistic
   * target. Always >= overall. The gap between the two is the product's core
   * promise, and it must never be inflated: fixed metrics are held constant.
   */
  reachable: z.number().min(0).max(100),

  subScores: z.array(subScoreSchema),
  metrics: z.array(metricResultSchema),
  recommendations: z.array(recommendationSchema),

  /** True when the full metric breakdown is gated behind the paywall. */
  locked: z.boolean(),
  /** Model + ruleset version. Required so old scans stay explainable. */
  engineVersion: z.string(),
});
export type ScanResult = z.infer<typeof scanResultSchema>;

// --- API contract -----------------------------------------------------------

export const createScanRequestSchema = z.object({
  /** One entry per captured pose. Front is required; side is optional. */
  images: z
    .array(
      z.object({
        pose: poseSchema,
        /** Supabase Storage object path. The API fetches it with a signed URL. */
        imagePath: z.string().min(1),
        quality: captureQualitySchema,
      }),
    )
    .min(1)
    .max(2),
});
export type CreateScanRequest = z.infer<typeof createScanRequestSchema>;

export const createScanResponseSchema = z.object({
  scanId: z.string().uuid(),
  status: scanStatusSchema,
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

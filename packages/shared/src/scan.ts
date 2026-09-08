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
  band: scoreBandSchema,
});
export type SubScore = z.infer<typeof subScoreSchema>;

export const recommendationSchema = z.object({
  id: z.string(),
  /** The metric that produced this recommendation — never invent unattributed advice. */
  drivenBy: z.array(z.string()),
  title: z.string(),
  body: z.string(),
  category: z.enum(['skincare', 'grooming', 'hair', 'posture', 'fitness', 'sleep', 'habits']),
  effort: z.enum(['daily', 'weekly', 'one_off']),
  /** Weeks before a visible change is realistic. Sets honest expectations. */
  horizonWeeks: z.number().int().positive(),
});
export type Recommendation = z.infer<typeof recommendationSchema>;

export const scanResultSchema = z.object({
  scanId: z.string().uuid(),
  status: scanStatusSchema,
  capturedAt: z.string().datetime(),
  pose: poseSchema,
  quality: captureQualitySchema,
  overall: z.number().min(0).max(100),
  band: scoreBandSchema,
  subScores: z.array(subScoreSchema),
  metrics: z.array(metricResultSchema),
  recommendations: z.array(recommendationSchema),
  /** Model + ruleset version. Required so old scans stay explainable. */
  engineVersion: z.string(),
});
export type ScanResult = z.infer<typeof scanResultSchema>;

// --- API contract -----------------------------------------------------------

export const createScanRequestSchema = z.object({
  /** Supabase Storage object path. The API fetches it with a signed URL. */
  imagePath: z.string().min(1),
  pose: poseSchema.default('front'),
  quality: captureQualitySchema,
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

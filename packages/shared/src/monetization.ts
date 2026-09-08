import { z } from 'zod';

/**
 * Monetisation model: the first scan is free and fully scored, so the user sees
 * their real baseline and the size of their gap. What the paywall gates is the
 * per-metric breakdown, the routine, and every scan after the first.
 *
 * Gating the first score instead would leave an empty app in front of App Store
 * review (Guideline 4.2) and give the user nothing to buy against.
 */
export const FREE_SCAN_ALLOWANCE = 1;

export const ENTITLEMENT = 'plus';

export const entitlementSchema = z.object({
  isActive: z.boolean(),
  productId: z.string().nullable(),
  store: z.enum(['app_store', 'play_store', 'stripe', 'promotional']).nullable(),
  periodEnd: z.string().datetime().nullable(),
});
export type Entitlement = z.infer<typeof entitlementSchema>;

export const scanQuotaSchema = z.object({
  used: z.number().int().nonnegative(),
  allowance: z.number().int().nonnegative(),
  /** True when the user may start another scan right now. */
  canScan: z.boolean(),
});
export type ScanQuota = z.infer<typeof scanQuotaSchema>;

/** What a free user sees on the result screen. Everything else is locked. */
export const FREE_TIER_VISIBLE = {
  /** The first scan always shows its own measurements — that is the baseline. */
  measurements: true,
  groupSummary: true,
  fullMetricDetail: false,
  recommendations: 'first_only' as const,
  /** Progress is the product. It is also what a second scan requires. */
  progressHistory: false,
};

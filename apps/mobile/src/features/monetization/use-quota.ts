import { FREE_SCAN_ALLOWANCE, type ScanQuota } from '@ayna/shared';
import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

import { apiFetch } from '@/lib/api';
import { queryKeys } from '@/lib/query-client';

const quotaResponseSchema = z.object({
  used: z.number().int().nonnegative(),
  allowance: z.number().int().nonnegative(),
  canScan: z.boolean(),
  entitled: z.boolean(),
});

/**
 * Decides between the shutter and the paywall. The server is the authority —
 * this only mirrors it, and the RLS policy `can_start_scan` is the real gate.
 * Never let a client-side value alone unlock a scan.
 */
export function useQuota() {
  return useQuery({
    queryKey: queryKeys.entitlements(),
    queryFn: () => apiFetch('/me/quota', quotaResponseSchema),
    staleTime: 30_000,
  });
}

export const OPTIMISTIC_FIRST_SCAN: ScanQuota = {
  used: 0,
  allowance: FREE_SCAN_ALLOWANCE,
  canScan: true,
};

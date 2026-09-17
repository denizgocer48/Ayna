import { z } from 'zod';

/**
 * When to scan again.
 *
 * Set against the measurement noise floor rather than against engagement. The
 * mutable metrics are all `slow`, and a change under four percent is reported as
 * held — so a weekly scan would show "nothing changed" nearly every week and
 * teach the user that the app does not work. The weekly rhythm belongs to the
 * routine, which genuinely changes weekly; measurement gets a month.
 *
 * See docs/product.md.
 */
export const SCAN_INTERVAL_DAYS = 28;

/** Below this, a rescan is very unlikely to show anything but noise. */
export const SCAN_TOO_EARLY_DAYS = 14;

export const scanReadinessSchema = z.enum(['first', 'too_early', 'early', 'due']);
export type ScanReadiness = z.infer<typeof scanReadinessSchema>;

export type ScanTiming = {
  readiness: ScanReadiness;
  daysSinceLast: number | null;
  daysUntilDue: number;
};

function daysBetween(fromIso: string, toIso: string): number {
  const from = Date.parse(`${fromIso}T00:00:00Z`);
  const to = Date.parse(`${toIso}T00:00:00Z`);
  return Math.floor((to - from) / 86_400_000);
}

/**
 * Whether a scan is worth taking today.
 *
 * `early` scans are allowed rather than blocked — it is the user's face and
 * their time — but the interface says plainly that a change may not be
 * measurable yet, so a "held" result is not read as failure.
 */
export function scanTiming(lastScanDate: string | null, today: string): ScanTiming {
  if (lastScanDate === null) {
    return { readiness: 'first', daysSinceLast: null, daysUntilDue: 0 };
  }

  const daysSinceLast = Math.max(0, daysBetween(lastScanDate, today));
  const daysUntilDue = Math.max(0, SCAN_INTERVAL_DAYS - daysSinceLast);

  const readiness: ScanReadiness =
    daysSinceLast >= SCAN_INTERVAL_DAYS
      ? 'due'
      : daysSinceLast < SCAN_TOO_EARLY_DAYS
        ? 'too_early'
        : 'early';

  return { readiness, daysSinceLast, daysUntilDue };
}

/**
 * Scan timing is set against the measurement noise floor, not against
 * engagement. Prompting a rescan before a change could possibly be measurable
 * produces a "nothing moved" screen, which teaches the user the app does not
 * work.
 */
import { describe, expect, it } from 'vitest';

import {
  SCAN_INTERVAL_DAYS,
  SCAN_TOO_EARLY_DAYS,
  scanTiming,
} from '../src/cadence';

const TODAY = '2026-09-17';

describe('scanTiming', () => {
  it('treats a user who has never scanned as ready', () => {
    const timing = scanTiming(null, TODAY);
    expect(timing.readiness).toBe('first');
    expect(timing.daysSinceLast).toBeNull();
    expect(timing.daysUntilDue).toBe(0);
  });

  it('is too early inside the noise window', () => {
    const timing = scanTiming('2026-09-14', TODAY);
    expect(timing.daysSinceLast).toBe(3);
    expect(timing.readiness).toBe('too_early');
  });

  it('allows an early scan once change is at least plausible', () => {
    // Allowed rather than blocked — it is the user's face and their time — but
    // the interface says a change may not be measurable yet.
    const timing = scanTiming('2026-08-31', TODAY);
    expect(timing.daysSinceLast).toBe(17);
    expect(timing.readiness).toBe('early');
  });

  it('is due after the full interval', () => {
    const timing = scanTiming('2026-08-20', TODAY);
    expect(timing.daysSinceLast).toBe(28);
    expect(timing.readiness).toBe('due');
    expect(timing.daysUntilDue).toBe(0);
  });

  it('counts down to the next scan', () => {
    const timing = scanTiming('2026-09-10', TODAY);
    expect(timing.daysUntilDue).toBe(SCAN_INTERVAL_DAYS - 7);
  });

  it('never reports a negative wait', () => {
    expect(scanTiming('2026-01-01', TODAY).daysUntilDue).toBe(0);
  });

  it('keeps the too-early window inside the interval', () => {
    expect(SCAN_TOO_EARLY_DAYS).toBeLessThan(SCAN_INTERVAL_DAYS);
  });
});

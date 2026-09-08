import type { MetricGroup } from '@ayna/shared';

export const GROUP_LABELS: Record<MetricGroup, string> = {
  eyes: 'Eyes',
  proportions: 'Proportions',
  jawline: 'Jawline',
  midface: 'Midface',
  skin: 'Skin',
  harmony: 'Harmony',
};

/** Shown on a sub-score the scan could not fully measure. */
export const INCOMPLETE_NOTE = 'Add a side photo to complete this';

export function formatScore(value: number): string {
  return Math.round(value).toString();
}

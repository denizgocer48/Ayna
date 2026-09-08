import type { MetricGroup } from '@ayna/shared';

export const GROUP_LABELS: Record<MetricGroup, string> = {
  eyes: 'Eyes',
  proportions: 'Proportions',
  jawline: 'Jawline',
  midface: 'Midface',
  skin: 'Skin',
  harmony: 'Harmony',
};

/** Shown on a group the scan could not fully measure. */
export const INCOMPLETE_NOTE = 'Add a side photo to complete this';

/** Measurements are unitless ratios or degrees; neither wants many decimals. */
export function formatMeasurement(value: number, unit: string): string {
  return unit === 'deg' ? `${value.toFixed(1)}°` : value.toFixed(2);
}

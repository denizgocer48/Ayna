import { METRIC_GROUPS, type MetricGroup, type MetricKey } from '@ayna/shared';

import { t } from '@/i18n';

export function groupLabel(group: MetricGroup): string {
  return t(`groups.${group}`);
}

export function metricLabel(key: MetricKey): string {
  return t(`metrics.${key}`);
}

/** Shown on a group the scan could not fully measure. */
export const INCOMPLETE_NOTE = 'Add a side photo to complete this';

/**
 * Measurements are unitless ratios, bounded indices, or degrees. None of them
 * wants more than two decimals — extra digits imply a precision the landmark
 * source does not have.
 */
export function formatMeasurement(value: number, unit: string): string {
  return unit === 'deg' ? `${value.toFixed(1)}°` : value.toFixed(2);
}

export type MeasurementRow = { key: MetricKey; value: number; unit: string };

/**
 * Arrange measurements into the groups the result screen renders, keeping
 * catalogue order within each and dropping groups with nothing measured.
 */
export function groupMeasurements(
  measurements: readonly MeasurementRow[],
): { group: MetricGroup; rows: MeasurementRow[] }[] {
  const byKey = new Map(measurements.map((row) => [row.key, row]));

  return (Object.keys(METRIC_GROUPS) as MetricGroup[])
    .map((group) => ({
      group,
      rows: METRIC_GROUPS[group]
        .map((key) => byKey.get(key))
        .filter((row): row is MeasurementRow => row !== undefined),
    }))
    .filter(({ rows }) => rows.length > 0);
}

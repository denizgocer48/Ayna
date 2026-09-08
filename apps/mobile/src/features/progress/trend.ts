import type { MetricChange, Trend } from '@ayna/shared';

import { trendColors } from '@/theme';

export function trendColor(trend: Trend): string {
  switch (trend) {
    case 'improved':
      return trendColors.improved;
    case 'declined':
      return trendColors.declined;
    case 'held':
      return trendColors.held;
    case 'not_comparable':
      return trendColors.notComparable;
  }
}

/**
 * Signed percentage, rounded. Returned as a string because the sign carries
 * meaning and a bare number would lose the leading plus.
 */
export function formatChange(change: MetricChange): string {
  const percent = Math.round(change.relativeChange * 100);
  if (percent === 0) return '0%';
  return percent > 0 ? `+${percent}%` : `${percent}%`;
}

/**
 * Headline for a progress screen.
 *
 * The rules encoded here are the honest ones: say nothing moved when nothing
 * moved, and never inflate a single change into a transformation. The category
 * this product competes with fails precisely by overstating, and a user who
 * works for eight weeks and is told a fiction does not come back.
 */
export function progressHeadline(changes: MetricChange[], daysSinceBaseline: number): string {
  const improved = changes.filter((change) => change.trend === 'improved').length;
  const declined = changes.filter((change) => change.trend === 'declined').length;
  const weeks = Math.floor(daysSinceBaseline / 7);

  if (weeks < 2) {
    return 'Too soon to measure change. Come back in a couple of weeks.';
  }
  if (improved === 0 && declined === 0) {
    return `Nothing measurably changed in ${weeks} weeks. That is worth knowing too.`;
  }
  if (improved > 0 && declined === 0) {
    return `${improved} measurement${improved > 1 ? 's' : ''} moved in the right direction.`;
  }
  if (improved === 0) {
    return `${declined} measurement${declined > 1 ? 's' : ''} moved the wrong way.`;
  }
  return `${improved} improved, ${declined} slipped.`;
}

/** Shown against every measurement that cannot show progress. */
export const NOT_COMPARABLE_NOTE =
  'Measured, but not tracked as progress — bone structure does not change, and we will not pretend otherwise.';

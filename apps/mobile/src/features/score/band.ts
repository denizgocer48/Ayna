import type { ScoreBand } from '@ayna/shared';
import { scoreBands } from '@/theme';

export function bandFor(score: number): ScoreBand {
  if (score < 40) return 'low';
  if (score < 65) return 'mid';
  if (score < 85) return 'high';
  return 'elite';
}

export function bandColor(score: number): string {
  return scoreBands[bandFor(score)].color;
}

/**
 * The gap between today's score and the reachable projection is what the user
 * is buying. Copy has to stay honest about it: an under-2-point gap is noise,
 * and promising a transformation there would be caught within a month.
 */
export function gapCopy(overall: number, reachable: number): string {
  const gap = Math.round(reachable - overall);

  if (gap < 2) {
    return 'You are close to your measured ceiling. The work here is holding it.';
  }
  if (gap < 6) {
    return `${gap} points of headroom — mostly consistency, not change.`;
  }
  if (gap < 12) {
    return `${gap} points of headroom. Skin and definition carry most of it.`;
  }
  return `${gap} points of headroom. Most of it is skin and body composition.`;
}

/**
 * Fixed metrics are excluded from the projection, so a user whose gap is small
 * needs to hear why rather than assume the app failed them.
 */
export const FIXED_METRIC_NOTE =
  'Bone structure is measured but not projected — it does not change without surgery, and we will not pretend otherwise.';

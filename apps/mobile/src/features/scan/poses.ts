import type { Pose } from '@ayna/shared';

import type { CopyKey } from '@/i18n';

/**
 * Front is required; side is optional but turns the estimated jaw metrics into
 * measured ones — gonial angle and chin projection are guessed from the front
 * and measured from the side.
 */
export const POSE_ORDER: readonly Pose[] = ['front', 'side'] as const;

export const POSE_COPY: Record<
  Pose,
  { titleKey: CopyKey; hintKey: CopyKey; optional: boolean }
> = {
  front: { titleKey: 'capture.frontTitle', hintKey: 'capture.frontHint', optional: false },
  side: { titleKey: 'capture.sideTitle', hintKey: 'capture.sideHint', optional: true },
};

/**
 * Rules that make two scans comparable rather than merely well-framed.
 *
 * The live gate cannot check any of these — it sees one frame, and consistency
 * is a property of the series. Shown before the first capture, where they can
 * still change what the user does.
 */
export const CONSISTENCY_KEYS = [
  'capture.consistency1',
  'capture.consistency2',
  'capture.consistency3',
  'capture.consistency4',
] as const satisfies readonly CopyKey[];

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

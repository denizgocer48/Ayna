import type { Pose } from '@ayna/shared';

/**
 * Front is required; side is optional but unlocks the metrics that actually
 * matter for the jawline group — gonial angle and chin projection are estimated
 * from the front and measured from the side.
 */
export const POSE_ORDER: readonly Pose[] = ['front', 'side'] as const;

export const POSE_COPY: Record<Pose, { title: string; hint: string; optional: boolean }> = {
  front: {
    title: 'Front',
    hint: 'Look straight into the lens. Neutral expression, mouth closed.',
    optional: false,
  },
  side: {
    title: 'Side',
    hint: 'Turn a full 90 degrees. Chin level, shoulders square.',
    optional: true,
  },
};

export const SIDE_POSE_BENEFIT =
  'A side photo measures your jaw angle and chin projection directly instead of estimating them from the front.';

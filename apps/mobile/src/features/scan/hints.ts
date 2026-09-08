import type { CaptureIssue } from '@ayna/shared';

import { t, type CopyKey } from '@/i18n';

/**
 * One instruction per issue, phrased as the action to take.
 *
 * "Move closer" is useful; "face too small" is a diagnosis the user has to
 * translate themselves.
 */
const HINT_KEYS: Record<CaptureIssue, CopyKey> = {
  no_face: 'capture.hints.noFace',
  multiple_faces: 'capture.hints.multipleFaces',
  face_too_small: 'capture.hints.faceTooSmall',
  face_too_close: 'capture.hints.faceTooClose',
  off_center: 'capture.hints.offCentre',
  head_turned: 'capture.hints.headTurned',
  head_tilted: 'capture.hints.headTilted',
  eyes_closed: 'capture.hints.eyesClosed',
  too_dark: 'capture.hints.tooDark',
  too_bright: 'capture.hints.tooBright',
  blurry: 'capture.hints.blurry',
};

export function hintFor(issue: CaptureIssue): string {
  return t(HINT_KEYS[issue]);
}

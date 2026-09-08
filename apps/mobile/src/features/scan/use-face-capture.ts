import {
  type CaptureQuality,
  evaluateCaptureQuality,
  isDegenerate,
  measureAll,
  type MetricKey,
  resolveFrontPoints,
} from '@ayna/shared';
import { useCallback, useRef, useState } from 'react';

import { type DetectedFace, toQualitySignals } from '@/features/scan/face-signals';

/**
 * Holds the latest detector result and turns it into a capture decision.
 *
 * The detector fires many times a second, so the quality object is state (the
 * UI needs to re-render) while the contours are a ref (nothing renders from
 * them, and putting them in state would re-render on every frame for nothing).
 */
export function useFaceCapture() {
  const [quality, setQuality] = useState<CaptureQuality | null>(null);
  const latestFace = useRef<DetectedFace | null>(null);

  const onFacesDetected = useCallback((faces: DetectedFace[]) => {
    latestFace.current = faces.length === 1 ? (faces[0] ?? null) : null;
    setQuality(evaluateCaptureQuality(toQualitySignals(faces)));
  }, []);

  /**
   * Measure the frame the user just accepted.
   *
   * Returns null rather than throwing when the frame turns out to be unusable:
   * the shutter is already gated on quality, so this is the rare race where the
   * face moved between the last detection and the tap. The caller asks the user
   * to try again, which is honest and cheap.
   */
  const measure = useCallback((): Partial<Record<MetricKey, number>> | null => {
    const face = latestFace.current;
    if (!face || quality?.ok !== true) return null;

    try {
      const points = resolveFrontPoints(face.contours ?? {}, face.landmarks ?? {});
      if (isDegenerate(points)) return null;
      return measureAll(points);
    } catch {
      // resolveFrontPoints throws when the detector omitted a contour. It
      // refuses to invent a landmark, and so do we.
      return null;
    }
  }, [quality]);

  return { quality, onFacesDetected, measure };
}

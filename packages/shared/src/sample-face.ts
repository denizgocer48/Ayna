/**
 * A synthetic face, used by the tests and by simulator builds.
 *
 * One canonical fixture rather than two: the tests assert against it, and a
 * build without a camera measures it so the interface can be walked with real
 * output from the real pipeline instead of hardcoded numbers. Numbers invented
 * for a mockup drift away from what the code actually produces; these cannot.
 *
 * Schematic and symmetric — midline at x = 0, y growing downward — so the
 * expected values are analytically checkable.
 */

import { point } from './geometry';
import type { FrontPoints, ProfilePoints } from './measure';
import { measureAll } from './measure';
import type { MetricKey } from './metrics';
import { METRIC_META } from './metrics';

/**
 * @param canthalRise how much higher the outer eye corner sits than the inner
 * one, in the same units as every other coordinate. Zero gives a level eye axis.
 */
export function sampleFrontPoints(canthalRise = 4): FrontPoints {
  return {
    foreheadTop: point(0, -100),
    glabella: point(0, -40),
    nasion: point(0, -30),
    subnasale: point(0, 20),
    menton: point(0, 80),
    leftLateralCanthus: point(40, -30 - canthalRise),
    rightLateralCanthus: point(-40, -30 - canthalRise),
    leftMedialCanthus: point(15, -30),
    rightMedialCanthus: point(-15, -30),
    leftPupil: point(27, -30),
    rightPupil: point(-27, -30),
    leftEyeTop: point(27, -38),
    rightEyeTop: point(-27, -38),
    leftEyeBottom: point(27, -22),
    rightEyeBottom: point(-27, -22),
    leftZygion: point(65, -20),
    rightZygion: point(-65, -20),
    leftGonion: point(55, 40),
    rightGonion: point(-55, 40),
    leftJawMid: point(40, 62),
    rightJawMid: point(-40, 62),
    leftAlare: point(12, 15),
    rightAlare: point(-12, 15),
    leftCheilion: point(22, 40),
    rightCheilion: point(-22, 40),
    labialeSuperius: point(0, 33),
    labialeInferius: point(0, 47),
    stomion: point(0, 40),
  };
}

export function sampleProfilePoints(): ProfilePoints {
  return {
    glabella: point(10, -40),
    nasion: point(8, -30),
    rhinion: point(18, -10),
    pronasale: point(32, 8),
    subnasale: point(14, 20),
    pogonion: point(16, 70),
    menton: point(10, 80),
    gonion: point(-45, 45),
    condylion: point(-52, -20),
    cervicalPoint: point(-20, 95),
  };
}

export type SampleMeasurement = {
  key: MetricKey;
  value: number;
  unit: (typeof METRIC_META)[MetricKey]['unit'];
};

/**
 * Measurements of the sample face, in catalogue order.
 *
 * Computed, not written down. If a formula changes, this changes with it.
 */
export function sampleMeasurements(options?: { withProfile?: boolean }): SampleMeasurement[] {
  const values = measureAll(
    sampleFrontPoints(),
    options?.withProfile ? sampleProfilePoints() : undefined,
  );

  return (Object.keys(METRIC_META) as MetricKey[])
    .filter((key) => values[key] !== undefined)
    .map((key) => ({ key, value: values[key]!, unit: METRIC_META[key].unit }));
}

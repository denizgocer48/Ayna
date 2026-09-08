import { z } from 'zod';

/**
 * The metric catalogue is deterministic geometry derived from face landmarks.
 * Every key here must be computable from landmarks alone — no model opinion,
 * no LLM. This is what makes a score reproducible across lighting conditions.
 *
 * Adding a metric: add the key here, implement it in services/api, and add a
 * reference distribution row in `metric_norms`. Never ship a metric without a
 * norm — an un-normalised metric cannot be turned into a percentile.
 */
export const METRIC_KEYS = [
  // Eye region
  'canthal_tilt',
  'interpupillary_ratio',
  'eye_aspect_ratio',
  'eye_spacing_ratio',
  // Facial proportions
  'facial_thirds_balance',
  'facial_fifths_balance',
  'fwhr',
  'face_length_width_ratio',
  // Jaw & chin
  'gonial_angle',
  'jawline_definition',
  'chin_projection_ratio',
  'mandible_width_ratio',
  // Nose & lips
  'nasofrontal_angle',
  'nose_width_ratio',
  'philtrum_length_ratio',
  'lip_fullness_ratio',
  // Global
  'symmetry_index',
] as const;

export const metricKeySchema = z.enum(METRIC_KEYS);
export type MetricKey = z.infer<typeof metricKeySchema>;

/** Grouping used by the score screen to render sub-scores. */
export const METRIC_GROUPS = {
  eyes: ['canthal_tilt', 'interpupillary_ratio', 'eye_aspect_ratio', 'eye_spacing_ratio'],
  proportions: [
    'facial_thirds_balance',
    'facial_fifths_balance',
    'fwhr',
    'face_length_width_ratio',
  ],
  jawline: ['gonial_angle', 'jawline_definition', 'chin_projection_ratio', 'mandible_width_ratio'],
  midface: ['nasofrontal_angle', 'nose_width_ratio', 'philtrum_length_ratio', 'lip_fullness_ratio'],
  harmony: ['symmetry_index'],
} as const satisfies Record<string, readonly MetricKey[]>;

export const metricGroupSchema = z.enum(
  Object.keys(METRIC_GROUPS) as [keyof typeof METRIC_GROUPS, ...(keyof typeof METRIC_GROUPS)[]],
);
export type MetricGroup = z.infer<typeof metricGroupSchema>;

export const metricResultSchema = z.object({
  key: metricKeySchema,
  /** Raw measurement in the metric's own unit (degrees, or a unitless ratio). */
  raw: z.number(),
  unit: z.enum(['deg', 'ratio', 'index']),
  /** 0-100 after normalising against the age/sex reference distribution. */
  percentile: z.number().min(0).max(100),
  /** Distance from the reference mean, in standard deviations. */
  zScore: z.number(),
});
export type MetricResult = z.infer<typeof metricResultSchema>;

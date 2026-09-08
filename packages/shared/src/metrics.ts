import { z } from 'zod';

/**
 * The metric catalogue.
 *
 * Two provenance classes live here and they are not interchangeable:
 *
 *   `geometry`     — deterministic distances and angles from face landmarks.
 *                    Same landmarks in, same number out. This is what makes a
 *                    score reproducible across lighting conditions.
 *   `segmentation` — skin findings from a vision model. Inherently noisier, so
 *                    these are reported with lower weight and never drive the
 *                    headline number on their own.
 *
 * The `mutability` field is what powers the potential score. Bone geometry does
 * not move without surgery; skin, definition and puffiness do. Telling a user
 * their gonial angle can improve would be a lie, and the product's whole claim
 * rests on not lying about that.
 */
export const METRIC_KEYS = [
  // --- front geometry -------------------------------------------------------
  'canthal_tilt',
  'interpupillary_ratio',
  'eye_aspect_ratio',
  'eye_spacing_ratio',
  'facial_thirds_balance',
  'facial_fifths_balance',
  'fwhr',
  'face_length_width_ratio',
  'gonial_angle',
  'jawline_definition',
  'chin_projection_ratio',
  'mandible_width_ratio',
  'nasofrontal_angle',
  'nose_width_ratio',
  'philtrum_length_ratio',
  'lip_fullness_ratio',
  'symmetry_index',
  // --- side geometry --------------------------------------------------------
  'gonial_angle_true',
  'ramus_body_ratio',
  'chin_projection_true',
  'nasofrontal_angle_true',
  'nasal_dorsum_index',
  'submental_cervical_angle',
  // --- skin -----------------------------------------------------------------
  'acne_density',
  'redness_index',
  'dark_circle_index',
  'pore_visibility',
  'texture_uniformity',
  'oiliness_index',
  'hyperpigmentation_index',
] as const;

export const metricKeySchema = z.enum(METRIC_KEYS);
export type MetricKey = z.infer<typeof metricKeySchema>;

export const provenanceSchema = z.enum(['geometry', 'segmentation']);
export type Provenance = z.infer<typeof provenanceSchema>;

/**
 * `fixed`      — bone or cartilage. Excluded from the potential score.
 * `slow`       — moves over months with body composition, sleep, hydration.
 * `responsive` — moves in weeks with routine adherence.
 */
export const mutabilitySchema = z.enum(['fixed', 'slow', 'responsive']);
export type Mutability = z.infer<typeof mutabilitySchema>;

export const unitSchema = z.enum(['deg', 'ratio', 'index']);
export type Unit = z.infer<typeof unitSchema>;

export const posingSchema = z.enum(['front', 'side', 'either']);

export type MetricMeta = {
  unit: Unit;
  provenance: Provenance;
  mutability: Mutability;
  /** Which capture this metric needs. `side` metrics are skipped front-only. */
  pose: 'front' | 'side' | 'either';
};

export const METRIC_META = {
  canthal_tilt: { unit: 'deg', provenance: 'geometry', mutability: 'fixed', pose: 'front' },
  interpupillary_ratio: { unit: 'ratio', provenance: 'geometry', mutability: 'fixed', pose: 'front' },
  eye_aspect_ratio: { unit: 'ratio', provenance: 'geometry', mutability: 'slow', pose: 'front' },
  eye_spacing_ratio: { unit: 'ratio', provenance: 'geometry', mutability: 'fixed', pose: 'front' },
  facial_thirds_balance: { unit: 'index', provenance: 'geometry', mutability: 'fixed', pose: 'front' },
  facial_fifths_balance: { unit: 'index', provenance: 'geometry', mutability: 'fixed', pose: 'front' },
  fwhr: { unit: 'ratio', provenance: 'geometry', mutability: 'fixed', pose: 'front' },
  face_length_width_ratio: { unit: 'ratio', provenance: 'geometry', mutability: 'fixed', pose: 'front' },
  gonial_angle: { unit: 'deg', provenance: 'geometry', mutability: 'fixed', pose: 'front' },
  jawline_definition: { unit: 'index', provenance: 'geometry', mutability: 'slow', pose: 'front' },
  chin_projection_ratio: { unit: 'ratio', provenance: 'geometry', mutability: 'fixed', pose: 'front' },
  mandible_width_ratio: { unit: 'ratio', provenance: 'geometry', mutability: 'fixed', pose: 'front' },
  nasofrontal_angle: { unit: 'deg', provenance: 'geometry', mutability: 'fixed', pose: 'front' },
  nose_width_ratio: { unit: 'ratio', provenance: 'geometry', mutability: 'fixed', pose: 'front' },
  philtrum_length_ratio: { unit: 'ratio', provenance: 'geometry', mutability: 'fixed', pose: 'front' },
  lip_fullness_ratio: { unit: 'ratio', provenance: 'geometry', mutability: 'slow', pose: 'front' },
  symmetry_index: { unit: 'index', provenance: 'geometry', mutability: 'fixed', pose: 'front' },

  gonial_angle_true: { unit: 'deg', provenance: 'geometry', mutability: 'fixed', pose: 'side' },
  ramus_body_ratio: { unit: 'ratio', provenance: 'geometry', mutability: 'fixed', pose: 'side' },
  chin_projection_true: { unit: 'ratio', provenance: 'geometry', mutability: 'fixed', pose: 'side' },
  nasofrontal_angle_true: { unit: 'deg', provenance: 'geometry', mutability: 'fixed', pose: 'side' },
  nasal_dorsum_index: { unit: 'index', provenance: 'geometry', mutability: 'fixed', pose: 'side' },
  submental_cervical_angle: { unit: 'deg', provenance: 'geometry', mutability: 'slow', pose: 'side' },

  acne_density: { unit: 'index', provenance: 'segmentation', mutability: 'responsive', pose: 'front' },
  redness_index: { unit: 'index', provenance: 'segmentation', mutability: 'responsive', pose: 'front' },
  dark_circle_index: { unit: 'index', provenance: 'segmentation', mutability: 'responsive', pose: 'front' },
  pore_visibility: { unit: 'index', provenance: 'segmentation', mutability: 'slow', pose: 'front' },
  texture_uniformity: { unit: 'index', provenance: 'segmentation', mutability: 'slow', pose: 'front' },
  oiliness_index: { unit: 'index', provenance: 'segmentation', mutability: 'responsive', pose: 'front' },
  hyperpigmentation_index: { unit: 'index', provenance: 'segmentation', mutability: 'slow', pose: 'front' },
} as const satisfies Record<MetricKey, MetricMeta>;

/** Grouping used by the score screen to render sub-scores. */
export const METRIC_GROUPS = {
  eyes: ['canthal_tilt', 'interpupillary_ratio', 'eye_aspect_ratio', 'eye_spacing_ratio'],
  proportions: [
    'facial_thirds_balance',
    'facial_fifths_balance',
    'fwhr',
    'face_length_width_ratio',
  ],
  jawline: [
    'gonial_angle',
    'jawline_definition',
    'chin_projection_ratio',
    'mandible_width_ratio',
    'gonial_angle_true',
    'ramus_body_ratio',
    'chin_projection_true',
    'submental_cervical_angle',
  ],
  midface: [
    'nasofrontal_angle',
    'nose_width_ratio',
    'philtrum_length_ratio',
    'lip_fullness_ratio',
    'nasofrontal_angle_true',
    'nasal_dorsum_index',
  ],
  skin: [
    'acne_density',
    'redness_index',
    'dark_circle_index',
    'pore_visibility',
    'texture_uniformity',
    'oiliness_index',
    'hyperpigmentation_index',
  ],
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
  unit: unitSchema,
  /** 0-100 after normalising against the age/sex reference distribution. */
  percentile: z.number().min(0).max(100),
  /** Distance from the reference mean, in standard deviations. */
  zScore: z.number(),
  /**
   * Where this metric could realistically land with sustained routine
   * adherence. Equals `percentile` for `fixed` metrics — by definition.
   */
  reachablePercentile: z.number().min(0).max(100),
});
export type MetricResult = z.infer<typeof metricResultSchema>;

export const SIDE_POSE_KEYS = METRIC_KEYS.filter((key) => METRIC_META[key].pose === 'side');
export const SKIN_KEYS = METRIC_KEYS.filter((key) => METRIC_META[key].provenance === 'segmentation');
export const FIXED_KEYS = METRIC_KEYS.filter((key) => METRIC_META[key].mutability === 'fixed');

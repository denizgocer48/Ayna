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

/**
 * Which way is better for this metric.
 *
 * `neutral` means there is no defensible "better" — a canon-balance index or a
 * proportion where deviation in either direction is not a defect. Neutral
 * metrics are measured and displayed, never scored as progress.
 */
export const directionSchema = z.enum(['higher_better', 'lower_better', 'neutral']);
export type Direction = z.infer<typeof directionSchema>;

export type MetricMeta = {
  unit: Unit;
  provenance: Provenance;
  mutability: Mutability;
  /** Which capture this metric needs. `side` metrics are skipped front-only. */
  pose: 'front' | 'side' | 'either';
  direction: Direction;
};

export const METRIC_META = {
  canthal_tilt: {
    unit: 'deg',
    provenance: 'geometry',
    mutability: 'fixed',
    pose: 'front',
    direction: 'neutral',
  },
  interpupillary_ratio: {
    unit: 'ratio',
    provenance: 'geometry',
    mutability: 'fixed',
    pose: 'front',
    direction: 'neutral',
  },
  eye_aspect_ratio: {
    unit: 'ratio',
    provenance: 'geometry',
    mutability: 'slow',
    pose: 'front',
    direction: 'higher_better',
  },
  eye_spacing_ratio: {
    unit: 'ratio',
    provenance: 'geometry',
    mutability: 'fixed',
    pose: 'front',
    direction: 'neutral',
  },
  facial_thirds_balance: {
    unit: 'index',
    provenance: 'geometry',
    mutability: 'fixed',
    pose: 'front',
    direction: 'higher_better',
  },
  facial_fifths_balance: {
    unit: 'index',
    provenance: 'geometry',
    mutability: 'fixed',
    pose: 'front',
    direction: 'higher_better',
  },
  fwhr: {
    unit: 'ratio',
    provenance: 'geometry',
    mutability: 'fixed',
    pose: 'front',
    direction: 'neutral',
  },
  face_length_width_ratio: {
    unit: 'ratio',
    provenance: 'geometry',
    mutability: 'fixed',
    pose: 'front',
    direction: 'neutral',
  },
  gonial_angle: {
    unit: 'deg',
    provenance: 'geometry',
    mutability: 'fixed',
    pose: 'front',
    direction: 'neutral',
  },
  jawline_definition: {
    unit: 'index',
    provenance: 'geometry',
    mutability: 'slow',
    pose: 'front',
    direction: 'higher_better',
  },
  chin_projection_ratio: {
    unit: 'ratio',
    provenance: 'geometry',
    mutability: 'fixed',
    pose: 'front',
    direction: 'neutral',
  },
  mandible_width_ratio: {
    unit: 'ratio',
    provenance: 'geometry',
    mutability: 'fixed',
    pose: 'front',
    direction: 'neutral',
  },
  nasofrontal_angle: {
    unit: 'deg',
    provenance: 'geometry',
    mutability: 'fixed',
    pose: 'front',
    direction: 'neutral',
  },
  nose_width_ratio: {
    unit: 'ratio',
    provenance: 'geometry',
    mutability: 'fixed',
    pose: 'front',
    direction: 'neutral',
  },
  philtrum_length_ratio: {
    unit: 'ratio',
    provenance: 'geometry',
    mutability: 'fixed',
    pose: 'front',
    direction: 'neutral',
  },
  lip_fullness_ratio: {
    unit: 'ratio',
    provenance: 'geometry',
    mutability: 'slow',
    pose: 'front',
    direction: 'neutral',
  },
  symmetry_index: {
    unit: 'index',
    provenance: 'geometry',
    mutability: 'fixed',
    pose: 'front',
    direction: 'higher_better',
  },

  gonial_angle_true: {
    unit: 'deg',
    provenance: 'geometry',
    mutability: 'fixed',
    pose: 'side',
    direction: 'neutral',
  },
  ramus_body_ratio: {
    unit: 'ratio',
    provenance: 'geometry',
    mutability: 'fixed',
    pose: 'side',
    direction: 'neutral',
  },
  chin_projection_true: {
    unit: 'ratio',
    provenance: 'geometry',
    mutability: 'fixed',
    pose: 'side',
    direction: 'neutral',
  },
  nasofrontal_angle_true: {
    unit: 'deg',
    provenance: 'geometry',
    mutability: 'fixed',
    pose: 'side',
    direction: 'neutral',
  },
  nasal_dorsum_index: {
    unit: 'index',
    provenance: 'geometry',
    mutability: 'fixed',
    pose: 'side',
    direction: 'neutral',
  },
  submental_cervical_angle: {
    unit: 'deg',
    provenance: 'geometry',
    mutability: 'slow',
    pose: 'side',
    direction: 'lower_better',
  },

  acne_density: {
    unit: 'index',
    provenance: 'segmentation',
    mutability: 'responsive',
    pose: 'front',
    direction: 'lower_better',
  },
  redness_index: {
    unit: 'index',
    provenance: 'segmentation',
    mutability: 'responsive',
    pose: 'front',
    direction: 'lower_better',
  },
  dark_circle_index: {
    unit: 'index',
    provenance: 'segmentation',
    mutability: 'responsive',
    pose: 'front',
    direction: 'lower_better',
  },
  pore_visibility: {
    unit: 'index',
    provenance: 'segmentation',
    mutability: 'slow',
    pose: 'front',
    direction: 'lower_better',
  },
  texture_uniformity: {
    unit: 'index',
    provenance: 'segmentation',
    mutability: 'slow',
    pose: 'front',
    direction: 'higher_better',
  },
  oiliness_index: {
    unit: 'index',
    provenance: 'segmentation',
    mutability: 'responsive',
    pose: 'front',
    direction: 'lower_better',
  },
  hyperpigmentation_index: {
    unit: 'index',
    provenance: 'segmentation',
    mutability: 'slow',
    pose: 'front',
    direction: 'lower_better',
  },
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

/**
 * A single measurement.
 *
 * Deliberately no percentile and no z-score. Converting a measurement into
 * "you are at the 62nd percentile" needs a published reference distribution per
 * sex and age band, and `docs/norms.md` records that roughly a third of these
 * metrics have none — nor is there any study validating our landmark source
 * against the anthropometric literature. A percentile printed on that basis
 * would be the kind of unsupported feature App Store Guideline 1.1.6 rejects.
 *
 * Progress against the user's own baseline needs no reference population at
 * all, which is what the product measures instead.
 */
export const measurementSchema = z.object({
  key: metricKeySchema,
  /** The measurement in its own unit: degrees, or a unitless ratio or index. */
  value: z.number(),
  unit: unitSchema,
});
export type Measurement = z.infer<typeof measurementSchema>;

export const trendSchema = z.enum(['improved', 'held', 'declined', 'not_comparable']);
export type Trend = z.infer<typeof trendSchema>;

/**
 * How one measurement moved against an earlier scan.
 *
 * `not_comparable` covers two cases that must not be dressed up as progress:
 * a `fixed` metric, where any movement is measurement noise rather than change,
 * and a `neutral` metric, where there is no defensible better direction.
 */
export const metricChangeSchema = z.object({
  key: metricKeySchema,
  unit: unitSchema,
  current: z.number(),
  baseline: z.number(),
  /** Signed fractional change from baseline. 0.08 is an eight percent rise. */
  relativeChange: z.number(),
  trend: trendSchema,
  /** False when the movement is inside the noise floor for this metric. */
  significant: z.boolean(),
});
export type MetricChange = z.infer<typeof metricChangeSchema>;

/**
 * Provisional noise floors, as a fraction of the baseline value.
 *
 * Below this, a change is not distinguishable from capture-to-capture variation
 * and must be reported as `held`. These numbers are deliberately conservative
 * and are NOT yet grounded in measurement — the calibration study in
 * `docs/norms.md` is what would ground them. Reporting noise as progress is the
 * same dishonesty as an unreliable score, wearing different clothes.
 */
export const NOISE_FLOOR: Record<Mutability, number> = {
  fixed: Infinity, // never comparable
  slow: 0.04,
  responsive: 0.03,
};

export const SIDE_POSE_KEYS = METRIC_KEYS.filter((key) => METRIC_META[key].pose === 'side');
export const SKIN_KEYS = METRIC_KEYS.filter((key) => METRIC_META[key].provenance === 'segmentation');
export const FIXED_KEYS = METRIC_KEYS.filter((key) => METRIC_META[key].mutability === 'fixed');

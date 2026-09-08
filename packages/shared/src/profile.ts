import { z } from 'zod';

/**
 * Age and sex are inputs to metric normalisation, not decoration: the same
 * gonial angle sits in a different percentile for a 19-year-old and a 45-year-old.
 */
export const sexSchema = z.enum(['male', 'female', 'prefer_not_to_say']);
export type Sex = z.infer<typeof sexSchema>;

export const goalSchema = z.enum([
  'skin_clarity',
  'jawline',
  'hair',
  'facial_hair',
  'body_composition',
  'sleep',
  'overall_confidence',
]);
export type Goal = z.infer<typeof goalSchema>;

export const profileSchema = z.object({
  userId: z.string().uuid(),
  displayName: z.string().max(60).nullable(),
  birthYear: z.number().int().min(1900).max(new Date().getFullYear()),
  sex: sexSchema,
  goals: z.array(goalSchema).max(4),
  locale: z.string().default('tr-TR'),
  /** Explicit biometric-data consent. No consent, no analysis — enforced in the API. */
  biometricConsentAt: z.string().datetime().nullable(),
  biometricConsentVersion: z.string().nullable(),
  /** Users under 18 are blocked from analysis; see docs/compliance.md. */
  ageConfirmedAt: z.string().datetime().nullable(),
});
export type Profile = z.infer<typeof profileSchema>;

export const MIN_AGE = 18;
export const CONSENT_VERSION = '2026-09-08.v1';

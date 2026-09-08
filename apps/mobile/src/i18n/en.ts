/**
 * English copy.
 *
 * Rules that apply to every string in this file and its translations:
 *   - No subculture vocabulary. See docs/compliance.md.
 *   - No medical claims. "Supports" and "helps" are fine, "treats" and "cures"
 *     are not.
 *   - Consent copy is legally operative text. Do not reword it without reading
 *     docs/compliance.md, and keep the two languages semantically identical.
 */
export const en = {
  common: {
    continue: 'Continue',
    back: 'Go back',
    cancel: 'Cancel',
    notNow: 'Not now',
    done: 'Done',
    close: 'Close',
    placeholder: 'PLACEHOLDER',
    optional: 'OPTIONAL',
  },

  welcome: {
    title: 'Ayna',
    tagline: 'Track your grooming and skincare progress with measurements, not guesswork.',
    body: 'Ayna measures facial proportions from a photo you take, turns them into a progress baseline, and builds a routine around what you can actually change.',
    cta: 'Get started',
  },

  ageGate: {
    question: 'Are you 18 or older?',
    why: 'Facial measurements are biometric data. Ayna is available to adults only.',
    yes: 'Yes, I am 18 or older',
    no: 'No',
    blockedTitle: 'Ayna is 18+',
    blockedBody:
      'Ayna analyses facial measurements, which counts as biometric data. We only offer that to adults. Thanks for your honesty.',
  },

  consent: {
    title: 'Your photo, your data',
    whatWeDoLabel: 'What we do',
    whatWeDoBody:
      'We measure geometric distances and angles from your photo to build a progress baseline and a routine.',
    whatWeKeepLabel: 'What we keep',
    whatWeKeepBody:
      'We keep the measurements. The photo itself is deleted from our servers right after analysis unless you explicitly save it to your progress timeline.',
    yourControlLabel: 'Your control',
    yourControlBody:
      'You can withdraw this consent and delete every scan at any time from Profile. Withdrawal removes the measurements too.',
    checkbox:
      'I explicitly consent to Ayna processing facial measurements derived from my photo, as described above.',
  },
} as const;

/**
 * Widen the literal types produced by `as const` so a translation can hold any
 * string, while the *shape* stays locked to the English catalogue — a missing or
 * misspelled key in a translation is still a compile error.
 */
type Widen<T> = { [K in keyof T]: T[K] extends string ? string : Widen<T[K]> };

export type Copy = Widen<typeof en>;

# Compliance notes

This file is not legal advice. It records the decisions already baked into the
code, so nobody undoes them by accident. Get a lawyer's review before launch.

## Facial measurements are biometric data

Under KVKK m.6 (Turkey) and GDPR Art. 9 (EU), biometric data used to identify or
characterise a person is special-category data. Consequences already implemented:

- **Separate, explicit consent.** `app/(onboarding)/consent.tsx` is its own
  screen with an affirmative checkbox. It cannot be bundled into general terms
  acceptance. Do not merge it into a "I accept the Terms" checkbox.
- **Consent is an append-only log.** `consent_events` records grant and
  withdrawal with the consent text version. A boolean column cannot prove *when*
  consent existed.
- **Consent is enforced twice.** The API checks it, and the RLS policies on
  `scans` and `storage.objects` check it via `has_active_biometric_consent()`.
- **Withdrawal must work.** Withdrawing consent deletes measurements too, not
  just future processing. `deletion_requests` tracks this.

## Data minimisation

The source photo is a means to an end. Once metrics are extracted we no longer
need it, and retaining it is the largest privacy liability in the product.

- `DELETE_IMAGE_AFTER_ANALYSIS=true` is the default.
- `scans.image_retained` marks the exception: a photo the user explicitly pinned
  to their progress timeline.
- Face images and landmark arrays must never reach analytics, logs or Sentry
  (`send_default_pii=False`).

## Age

18+ only. Enforced at three levels: the onboarding age gate, the
`profiles_adults_only` check constraint, and store age rating. Processing a
minor's facial biometrics carries a materially heavier burden and is not worth
the addressable market.

## App Store positioning

Apps that rate physical attractiveness get rejected under Guideline 1.1.1
(objectionable content) and 4.2 (minimum functionality). Ayna is submitted and
marketed as a **grooming and skincare progress tracker**:

- The score is framed as a personal baseline to improve against, never as a
  ranking against other people.
- No leaderboards, no comparisons between users, no "rate my face" social loop.
- Screenshots and the store listing show the routine and progress views, not a
  number over a face.

## Claims

No medical claims. `services/api/app/analysis/recommendations.py` keeps a
`FORBIDDEN_TOPICS` list: surgery, fillers, botox, prescription medication.
Recommendations cover skincare, grooming, hair, sleep, posture and body
composition — levers the user can move without a clinician. Claiming to treat a
condition puts the app in a regulated medical-device category.

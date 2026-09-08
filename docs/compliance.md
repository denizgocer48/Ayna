# Compliance notes

This file is not legal advice. It records the decisions already baked into the
code, so nobody undoes them by accident. Get a lawyer's review before launch.

The evidence behind these decisions — guideline text, regulator timelines, what
happened to comparable apps — is in `docs/market.md`.

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
the addressable market — and the documented harm in this category (body
dysmorphia, disordered eating) is concentrated in teenagers.

Apple replaced the old 12+ and 17+ tiers with 13+, 16+ and 18+. **We rate 18+.**
Every app must complete Apple's updated age-rating questionnaire — the deadline
passed on 31 January 2026 and apps that have not completed it are blocked from
submitting updates. The questionnaire now asks specifically about medical and
wellness content, which a skincare and grooming app has to answer carefully:
tracking a routine is wellness, diagnosing a condition is not something we do.

## App Store positioning

Two guidelines govern this category directly.

**Guideline 1.2** allows removal *without notice* of apps used primarily for
"objectification of real people (e.g. 'hot-or-not' voting)". This is why the
product has no social layer at all: no leaderboard, no ranking against other
users, no shareable rank card. Percentiles exist internally so a raw measurement
can be normalised; they are never presented as a scoreboard. **Do not add a
social ranking feature to this product.**

**Guideline 1.1.6** rejects "false information and features" and states
explicitly that calling an app "for entertainment purposes" does not overcome
the guideline. An unreliable score is therefore not defensible as a bit of fun.
This is a compliance argument for the deterministic scoring in
`docs/product.md`, not only a product-quality one.

Guideline 4.2 (minimum functionality) is why the first scan is free and fully
scored — review should never open an app that shows nothing without payment.

Ayna is submitted and marketed as a **grooming and skincare progress tracker**:

- The score is framed as a personal baseline to improve against, never as a
  ranking against other people. The headline is two numbers — today and
  reachable — so the screen reads as a starting point, not a verdict.
- No leaderboards, no comparisons between users, no "rate my face" social loop.
- Screenshots and the store listing show the routine and progress views, not a
  number over a face.

## EU AI Act: never infer an attribute from a face

The AI Act prohibits categorising people individually from their biometric data
in order to infer race, ethnicity, political opinions, trade union membership,
religious or philosophical beliefs, sex life or sexual orientation. That
prohibition applies from December 2026.

The design already avoids this and must keep avoiding it:

- **Age and sex come from the user's own profile**, never from the image.
  `metric_norms` is keyed on self-declared `sex` and `birth_year`.
- **Do not add ethnicity as a normalisation dimension**, and do not add any model
  that predicts a demographic attribute from a face. An early architecture sketch
  in this project proposed ethnicity-based normalisation; that idea is dead.
- An EU launch needs counsel to confirm whether our biometric processing triggers
  the Act's transparency obligations. Treat that review as a launch dependency.

## Vocabulary

The public criticism of this category attaches to specific language: the PSL 1-8
scale, tier labels such as "low-tier normie", "ascension", "mogging". Researchers
describe this vocabulary as part of a radicalisation pipeline, and it is the
fastest way to be grouped with the apps in `docs/market.md`.

None of it appears in Ayna — not in the UI, not in marketing copy, and not in the
recommendation text the LLM generates. `FORBIDDEN_TOPICS` in
`services/api/app/analysis/recommendations.py` blocks these terms alongside the
medical ones, and generated copy is checked against it before it is stored.

## Claims

No medical claims. `services/api/app/analysis/recommendations.py` keeps a
`FORBIDDEN_TOPICS` list: surgery, fillers, botox, prescription medication.
Recommendations cover skincare, grooming, hair, sleep, posture and body
composition — levers the user can move without a clinician. Claiming to treat a
condition puts the app in a regulated medical-device category.

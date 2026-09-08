# Roadmap

Search the code for `TODO(faz-N)` to find the exact call sites for each phase.
Product decisions behind this scope: `docs/product.md`.

Estimated 10-12 weeks to a store submission, after skin analysis was deferred out
of V1 (see `docs/skin-analysis.md` for why, and for what that costs the reachable
projection).

## Faz 0 — skeleton (done)

Monorepo, Expo app with route structure, design tokens and UI primitives, the
shared metric contract (30 metrics with provenance and mutability), FastAPI
skeleton with the reachable-score projection implemented and tested, Supabase
schema with RLS, CI.

## Faz 1 — capture (3 weeks)

- Supabase auth: Apple + Google sign-in.
- Onboarding: birth year and sex — these select the normalisation band and are
  not optional for a mixed audience.
- VisionCamera preview, face-oval overlay, live quality gate. Shutter disabled
  until `evaluateCaptureQuality` returns ok.
- Two-pose flow: front required, side optional.
- Upload to Storage, consent event written on grant.
- Profile: consent withdrawal and full data deletion. Legal requirements — they
  ship in the first release.

## Faz 2 — measurement and routine (5 weeks)

- MediaPipe Face Landmarker in the worker.
- 23 geometric metrics: 17 front, 6 side.
- Measurement screen: baseline on the first scan, change against baseline after.
  No gauge, no score — see `docs/product.md` section 1.
- Progress timeline and the before/after comparison.
- Recommendations: rule selection over the measurement table, then Claude for the
  copy. The model sees measurements and what moved, never the image.
- **Routine generation and daily check-off.** Moved here from Faz 3: with
  progress as the primary claim, the routine is what produces the change being
  measured, so shipping one without the other delivers half a product.

## Faz 3 — retention (2 weeks)

- Streaks and notifications around the routine.
- Weekly scan reminders timed to the noise floor: prompting a rescan sooner than
  a measurable change is possible produces a "nothing moved" screen and teaches
  the user the app does not work.

## Faz 4 — monetisation (2 weeks)

- RevenueCat products and the `plus` entitlement, webhook into `subscriptions`.
- `GET /me/quota`, paywall placement after the first result.
- PostHog funnels: install to first scan to purchase.

## Faz N — skin analysis (deferred)

Not in V1. Blocked on a vendor that will commit in writing to an EU-hosted
option, a DPA with SCCs, no training reuse and one stated retention period — or
on a viable on-device model. `skin.py` is written provider-agnostic so this drops
in without touching the scoring layer. See `docs/skin-analysis.md`.

## Faz 5 — release (2 weeks)

- EAS production builds, TestFlight and Play internal testing.
- Two sets of store listings, written against `docs/compliance.md` positioning.
- Privacy policy, terms, data deletion endpoint.

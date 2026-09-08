# Roadmap

Search the code for `TODO(faz-N)` to find the exact call sites for each phase.

## Faz 0 — skeleton (done)

Monorepo, Expo app with route structure, design tokens and UI primitives,
shared zod contract, FastAPI skeleton, Supabase schema with RLS, CI.

## Faz 1 — capture (2-3 weeks)

- Supabase auth: Apple + Google sign-in.
- Onboarding: birth year, sex, goals — these select the normalisation band.
- VisionCamera preview, face-oval overlay, live quality gate. Shutter stays
  disabled until `evaluateCaptureQuality` returns ok.
- Upload to Storage, consent event written on grant.
- Profile: subscription status, consent withdrawal, full data deletion. These
  are legal requirements and ship in the first release, not later.

## Faz 2 — analysis (3-4 weeks)

- MediaPipe Face Landmarker in the worker.
- The 17 metrics in `analysis/metrics.py`.
- Seed `metric_norms` and implement percentile normalisation.
- Score screen: Skia gauge, sub-score radar, metric breakdown.
- Recommendations: rule selection, then Claude for the copy.

## Faz 3 — habit loop (2 weeks)

- Routine generation from a scan, daily check-off.
- Progress timeline and before/after comparison.
- Notifications for the daily routine.

## Faz 4 — monetisation (1-2 weeks)

- RevenueCat products and entitlements, webhook into `subscriptions`.
- Paywall placement and onboarding funnel.
- PostHog funnels: install to first scan to purchase.

## Faz 5 — release

- EAS production builds, TestFlight and Play internal testing.
- Store listings written against `docs/compliance.md` positioning.
- Privacy policy, terms, data deletion endpoint.

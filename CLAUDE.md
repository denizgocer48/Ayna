# Ayna — working notes

Facial-measurement grooming coach. Measurement runs on the device; the FastAPI
service stores measurements, computes progress and generates the routine.
Supabase provides identity and the database — no file storage, because no image
is ever uploaded.

## Read first

- `docs/README.md` — index of everything below
- `docs/handoff.md` — current status, setup traps, what is real vs placeholder
- `docs/backlog.md` — parked ideas, and ideas already ruled out with reasons
- `docs/product.md` — the four decisions the whole build rests on, plus positioning
- `docs/market.md` — what the incumbents got wrong, and the rules that follow
- `docs/architecture.md` — how a scan flows through the system
- `docs/compliance.md` — the constraints that are legal requirements
- `docs/roadmap.md` — what each `TODO(faz-N)` marker means

## Non-negotiables

**Measurement stays deterministic.** Metrics are geometry computed from
landmarks. Never ask an LLM to rate a face — the same face measured twice in one
session must give the same numbers. The LLM writes the recommendation copy from
the measurement table, never from the image.

**No social layer, ever.** No leaderboard, no ranking against other users, no
shareable rank card, no "top X% of men". App Store Guideline 1.2 allows removal
*without notice* for apps built around "objectification of real people", and
every incumbent leads with exactly that framing.

**No subculture vocabulary.** PSL, mogging, ascension, tier labels, mewing.
`policy_violations()` in `analysis/recommendations.py` blocks them in generated
copy — do not work around it, and do not let them into the UI or marketing
either.

**Never infer an attribute from a face.** Age and sex come from the user's
profile. The EU AI Act prohibits inferring demographic attributes from biometrics
as of December 2026, and ethnicity is not a normalisation dimension here.

**Consent gates everything.** A scan cannot be created without live biometric
consent. This is enforced in the API *and* in RLS
(`has_active_biometric_consent`). Do not remove either layer.

**The photo never leaves the device.** Measurement runs on the phone; only the
23 derived scalars are uploaded. A landmark set is a biometric template and must
not be sent either — only the measurements. This is what removed the KVKK
cross-border problem, and re-introducing any image upload brings it back.

**The detector lives behind `resolve-points.ts`.** `measureAll` works from named
anatomical points and must never learn detector indices. That layer is why the
detector could change from MediaPipe to ML Kit without touching the arithmetic.

**There is no score, and progress must stay honest.** The product reports
measurements and change against the user's own first scan. A percentile was
removed rather than grounded — `docs/norms.md` records that a third of the
metrics have no published reference distribution and that nothing validates our
landmark source against the literature.

`analysis/progress.py` enforces two refusals that the UI must never work around:
a `fixed` metric can never show progress, because movement in bone geometry is
measurement noise; and movement inside `NOISE_FLOOR` is `held`, not a win. Those
floors are conservative guesses, not measurements — lowering them to make
progress look better is how the product dies at week eight.

**Adding a metric touches three places** or it does not ship:
`packages/shared/src/metrics.ts` (key + `METRIC_META` + a group),
`packages/shared/src/measure.ts` (the implementation), and
`services/api/app/schemas.py` (`_METRIC_ROWS` + the group).
`tests/test_contract.py` compares the two catalogues position by position and
fails CI on any drift.

**Quota is enforced in the database.** One free scan, then an active
entitlement — `can_start_scan()` gates the `scans` insert. The API check exists
to return a readable error, not as the gate.

## Conventions

- Node 22 (`.nvmrc`). npm workspaces — install from the repo root.
- Two iOS build profiles: `npm run ios:sim` and `npm run ios:device`. ML Kit has
  no arm64-simulator slice, so the detector is excluded from simulator builds.
  The failure mode if you forget is a misleading "Unable to find a destination"
  from xcodebuild — see `docs/handoff.md`.
- Measurement code lives in `packages/shared` and is tested with vitest
  (`npm test`). The Python service holds progress, recommendations and the
  contract mirror, tested with pytest.
- Mobile: feature-first under `src/features`, shared primitives in
  `src/components/ui`, design tokens in `src/theme`. Never hardcode a colour.
- API responses parse through zod at the boundary (`src/lib/api.ts`), so
  contract drift fails loudly instead of rendering `undefined`.
- Python: ruff, line length 100, strict mypy.

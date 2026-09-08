# Ayna — working notes

Facial-measurement grooming coach. Expo mobile app, FastAPI analysis service,
Supabase for identity/data/storage.

## Read first

- `docs/architecture.md` — how a scan flows through the system
- `docs/compliance.md` — the constraints that are legal requirements
- `docs/roadmap.md` — what each `TODO(faz-N)` marker means

## Non-negotiables

**Scoring stays deterministic.** Metrics are geometry computed from landmarks.
Never ask an LLM to rate a face — the score must be reproducible across two
photos in the same session. The LLM writes the recommendation copy, from the
metric table, never from the image.

**Consent gates everything.** A scan cannot be created without live biometric
consent. This is enforced in the API *and* in RLS
(`has_active_biometric_consent`). Do not remove either layer.

**The photo is deleted after analysis** unless the user pinned it. Face images
and landmark arrays never reach logs, analytics or Sentry.

**Adding a metric touches three places** or it does not ship:
`packages/shared/src/metrics.ts`, `services/api/app/analysis/metrics.py`, and a
`metric_norms` row. `tests/test_contract.py` fails CI otherwise.

## Conventions

- Node 22 (`.nvmrc`). npm workspaces — install from the repo root.
- Mobile: feature-first under `src/features`, shared primitives in
  `src/components/ui`, design tokens in `src/theme`. Never hardcode a colour.
- API responses parse through zod at the boundary (`src/lib/api.ts`), so
  contract drift fails loudly instead of rendering `undefined`.
- Python: ruff, line length 100, strict mypy.

# Ayna — working notes

Facial-measurement grooming coach. Expo mobile app, FastAPI analysis service,
Supabase for identity/data/storage.

## Read first

- `docs/product.md` — the four decisions the whole build rests on
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

**The projection must stay honest.** The result screen shows today's score
and a reachable projection (`68 → 79`). `fixed` metrics — bone geometry — are
excluded from that projection, and the gain caps in `REACHABLE_GAIN` are there
to stop it overpromising. Widening them to make the paywall more attractive is
how the product dies at week eight.

**Adding a metric touches three places** or it does not ship:
`packages/shared/src/metrics.ts` (key + `METRIC_META` + a group),
`services/api/app/schemas.py` (`_METRIC_ROWS` + the group), and a `metric_norms`
row. `tests/test_contract.py` compares the two catalogues position by position
and fails CI on any drift.

**Quota is enforced in the database.** One free scan, then an active
entitlement — `can_start_scan()` gates both the `scans` insert and the storage
upload. The API check exists to return a readable error, not as the gate.

## Conventions

- Node 22 (`.nvmrc`). npm workspaces — install from the repo root.
- Mobile: feature-first under `src/features`, shared primitives in
  `src/components/ui`, design tokens in `src/theme`. Never hardcode a colour.
- API responses parse through zod at the boundary (`src/lib/api.ts`), so
  contract drift fails loudly instead of rendering `undefined`.
- Python: ruff, line length 100, strict mypy.

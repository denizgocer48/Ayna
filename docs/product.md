# Product decisions

Decided 2026-09-08. These four choices are load-bearing — several of them are
encoded in the schema and the scoring layer, so changing one is a migration, not
a copy edit.

## 1. Two numbers, never one

The result screen shows **today's score and the reachable projection**: `68 → 79`.

Today's score alone reads as a verdict on the person. Today-versus-reachable
reads as a starting point with a route out, which is the product we are actually
building — and it is what keeps the app out of the "attractiveness rating"
category in App Store review.

The projection is computed by holding every `fixed` metric constant and moving
`slow` and `responsive` metrics toward a capped target
(`services/api/app/analysis/scoring.py`). Bone geometry is measured but never
projected. The caps exist so the gap cannot be inflated: a user who works for
eight weeks and does not reach the promised number never comes back.

## 2. Mixed audience, 18-35

Both men and women. Consequences already in the schema:

- Two sets of reference distributions in `metric_norms`, keyed by `sex` and age
  band. A percentile computed against the wrong reference is worse than no
  percentile.
- Two recommendation libraries. The jawline and facial-hair advice that carries
  the male funnel is not the advice that carries the female one.
- Two marketing positions. Do not ship one set of screenshots for both.

The cost is roughly 1.6x the work of a single-audience V1, against roughly 2x
the market.

## 3. One free scan, then the paywall

The first scan is free and fully scored. Locked behind the paywall: the
per-metric breakdown, the routine, the progress timeline, and every subsequent
scan.

Gating the first score instead would put an empty app in front of App Store
review and give the user nothing concrete to buy against. Enforced in
`can_start_scan()` at the RLS layer, mirrored by `GET /me/quota` so the client
can show the right button.

## 4. V1 scope

Front geometry **and** skin analysis **and** side profile **and** the routine
loop. This is a wide V1 — roughly 13-15 weeks rather than the 8-10 that front
geometry alone would need. The scope was chosen deliberately; see
`docs/roadmap.md` for the phasing.

The pieces are not independent:

- Skin carries nearly all of the reachable gain. Without it the projection is
  small and the paywall has little to sell.
- The side profile turns estimated jaw metrics into measured ones. Without it
  the jawline sub-score is marked `complete: false`.
- The routine loop is the entire retention story. Without it the app is a
  single-use toy regardless of how good the analysis is.

## 5. Positioning

Written against April Dunford's framework. The evidence for every claim is in
`docs/market.md`.

**Competitive alternatives.** Umax and LooksMax AI (direct). Skin-analysis apps
like YouCam (adjacent, female-skewed). A dermatologist or barber (offline). Doing
nothing, which is what most of the market does.

**Unique attributes.** A score that reproduces across two photos of the same face,
because it is landmark geometry behind a hard capture-quality gate rather than a
model asked for an opinion. An explicit separation between what can change and
what cannot. No social layer at all.

**Value those attributes create.** The user can trust the number enough to act on
it, and can measure whether eight weeks of effort moved anything. With the
incumbents they cannot: the top complaint in their reviews is that the same photo
scores differently each upload.

**Best-fit customer.** Adults 18-35, mixed audience, who already spend money on
skincare or grooming and want to know whether it is working. Not teenagers
looking for a verdict on themselves — that audience is where the documented harm
and the regulatory exposure both sit.

**Market category.** A grooming and skincare *progress tracker* that happens to
use facial measurement — not a face-rating app. This is a positioning choice and
also a compliance one: App Store Guideline 1.2 allows removal without notice for
apps built around objectifying real people.

**One-liner.** *Ayna measures what skincare and grooming actually changed, so you
can tell progress from wishful thinking.*

**Trends that make this the moment.** Incumbents are large enough to have
generated a public backlash and a documented list of failures to avoid. Apple
tightened both age ratings and objectionable-content rules in 2026. The EU AI Act
biometric provisions land in December 2026. A product designed around those
constraints from day one has an advantage over one retrofitting them.

## 6. Naming is unresolved

`Ayna` collides with a wall of Turkish mirror utilities in the App Store,
including an app already called "Ayna AI", and the metaphor argues against the
positioning — a mirror shows what is already there, this product measures change.

The name is currently hardcoded in the Expo slug, the URL scheme, the bundle ID
`com.ayna.app`, the npm workspace names and the repo name. Changing it is a
half-day pre-launch and effectively impossible after the first store submission.
**Decide before Faz 1 ends.** Criteria and the collision evidence are in
`docs/market.md`.

# Product decisions

Decided 2026-09-08. These four choices are load-bearing — several of them are
encoded in the schema and the scoring layer, so changing one is a migration, not
a copy edit.

## 1. Progress, not a score

**Revised 2026-09-08.** The design originally showed two numbers — today's score
and a reachable projection. That framing is gone, replaced by change measured
against the user's own first scan.

Two independent lines of evidence forced it. `docs/norms.md` found that roughly a
third of the metrics have no published reference distribution, and that nothing
validates our landmark source against the anthropometric literature — so a
percentile could not be grounded, and printing one would be the unsupported
feature App Store Guideline 1.1.6 rejects. Separately, a competitive review
concluded that comparing a user to their own history rather than to other people
is both the stronger retention mechanic and the safer position under Guideline
1.2. Both roads led to the same product.

What the user sees:

- **First scan:** their measurements, recorded as a baseline. No score, no rank.
- **Later scans:** what moved, by how much, in which direction.

Three rules keep it honest, and all three are enforced in
`services/api/app/analysis/progress.py` rather than left to the interface:

1. **A `fixed` metric can never show progress.** Bone geometry does not move, so
   any difference between two scans is measurement noise. It is reported as
   `not_comparable` and shown in a muted colour — information, not a verdict.
2. **A movement inside the noise floor is `held`, not progress.** Dressing up
   noise as a win is the same dishonesty as an unreliable score.
3. **There is no group score.** A single number over a group needs weights, and
   weighting measurements in different units needs the reference distribution we
   do not have. Groups report counts: how many improved, held, declined.

What this costs: the headline number that makes a screenshot shareable. What it
buys: a claim that survives contact with a user who checks.

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

Front geometry, side profile, and the routine loop. Skin analysis is deferred —
see `docs/skin-analysis.md`.

**The routine moved from Faz 3 into Faz 2**, alongside the measurement screen.
With progress as the primary claim, the routine is not a follow-on feature: it
is the thing that produces the change progress measures. Shipping measurement
without it would deliver an app that tells you nothing moved, and offers nothing
to move it.

The side profile turns estimated jaw metrics into measured ones. Without it the
jawline group reports `complete: false` rather than being scored from a partial
set.

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

## 6. Naming: Ayna, decided

Decided 2026-09-08. The name stays `Ayna`, with the collision cost accepted
knowingly. The evidence against it is in `docs/market.md`: the Turkish App Store
already holds several mirror and makeup utilities using the exact word, one of
them called "Ayna AI".

Because the brand term is contested, **the store title carries the keywords and
the brand carries the identity**. This is the standard mitigation and it costs
nothing:

```
Turkish store   Ayna: Cilt ve Bakım Takibi
English store   Ayna: Skincare Progress
```

App Store allows 30 characters for the title and 30 for the subtitle. The word
`Ayna` alone would compete against literal mirror apps for a query it cannot
win; `Ayna: Cilt ve Bakım Takibi` competes for the queries our users actually
type. Keep the suffix on every listing, in both languages.

Two rules that follow:

- Never ship a store listing whose title is the bare word `Ayna`.
- Revisit the name if Turkish store search proves unworkable after launch. The
  identifiers (`com.ayna.app`, the `ayna` slug and URL scheme) are frozen from
  first submission onward, so a later rename means a new app listing, not an
  update.

## 7. Market: Turkish and English from day one

Decided 2026-09-08. Both languages ship in the first release rather than Turkish
first with English later.

What this costs, concretely:

- **Two copy catalogues**, `src/i18n/en.ts` and `tr.ts`. English is the fallback:
  an untranslated string surfacing in English is recoverable, one surfacing in a
  language the reader does not know is not.
- **Consent text in both languages, legally equivalent.** Consent is only valid
  if the user could read what they agreed to, so `consent_events` records the
  locale alongside the version. Translate meaning, not words — but never add,
  soften or remove an obligation in translation.
- **Two sets of reference distributions.** `metric_norms` rows fitted on a
  Turkish population do not transfer to a general English-speaking one. This
  doubles the largest unknown in Faz 2.
- **Two store listings**, two sets of screenshots, two ASO keyword sets.
- **An EU legal review becomes a first-release dependency**, not a second-phase
  one, because an English listing means EU availability and the AI Act biometric
  provisions land in December 2026.

## 8. What we refuse to copy

A review of Hiface, LooxUP and LooksMax AI in September 2026 found the same
pattern in all three. Some of it is worth learning from; four things are not.

**No ranking against other people.** Hiface leads with "Top 15% of men". LooxUP
advertises showing "how you compare to other men". This is the framing App Store
Guideline 1.2 permits removal without notice for, and it is the opposite of the
claim we can actually support.

**No score-sharing.** Hiface puts Instagram, X, TikTok, Snapchat and WhatsApp
buttons directly under the score. That viral loop is built on sharing a rank,
which is the thing we do not produce. Sharing a personal before-and-after is a
different question and can be revisited; sharing a number is not.

**No masculinity or femininity score.** LooxUP reports a "Masculinity Index";
Hiface shows "Masculinity 90". Producing a gendered aesthetic verdict from a face
sits badly with Guideline 1.2 and edges toward the demographic inference the EU
AI Act prohibits.

**No mewing, and no unevidenced routine items.** It appears throughout the
category. A 2022 systematic review in the American Journal of Orthodontics found
no high-quality evidence it treats skeletal malocclusion in adults; adult facial
bones are set, and posture does not remodel bone. In November 2024 the UK General
Dental Council erased Mike Mew from the dental register over misleading public
claims. We serve adults only — precisely the population where it demonstrably
does not work. It is on the blocklist in
`services/api/app/analysis/recommendations.py`, and every routine item must be
evidence-backed on the same standard.

What is worth learning: the daily routine with a streak is the retention engine,
and progress against your own history is the strongest and safest framing. Both
are now central rather than peripheral.

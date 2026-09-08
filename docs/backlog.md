# Backlog: parked and ruled out

Two lists. The first is work we deliberately postponed and intend to revisit.
The second is work we decided against — recorded so nobody spends a week
re-deriving a conclusion we already reached.

Neither list is a roadmap. `roadmap.md` is the roadmap.

---

## Parked — revisit deliberately

### The reachable gap is thin without skin analysis

**Parked 2026-09-08. Revisit as a feature discussion before the store listing
copy is written.**

The product's headline is two numbers: today's score and a reachable projection.
With skin analysis included the gap is about six points. Without it — the V1
scope — it is about three, measured against the real scoring code, because every
`responsive` metric was a skin metric and only four `slow` ones remain.

Our own `gapCopy()` renders a three-point gap as *"mostly consistency, not
change"*. That is honest, and it is a weaker pitch than the design assumed.

Options when this is picked up:

1. **Position V1 as progress tracking rather than transformation.** Cheap,
   available today, and defensible — the honest framing is itself the
   differentiator against a category built on overpromising.
2. **Bring skin back in** once a vendor commits in writing (see below). Restores
   the gap, costs weeks and a legal review.
3. **Find more genuinely mutable geometry.** Weakest option — the whole
   discipline of the metric catalogue is that bone geometry does not move, and
   loosening that to widen the gap is exactly the failure mode `product.md`
   warns against.

Do not resolve this by widening the caps in `REACHABLE_GAIN`.

### Reintroducing percentiles

**Resolved 2026-09-08 by removing them.** V1 reports measurements and progress
against the user's own baseline; `metric_norms` and `scores` were dropped.

Revisit only with data that grounds the claim: published norms for the metrics
that lack them, and a calibration study anchoring our landmark output to the
anthropometric literature. `docs/norms.md` keeps the full path. Do not
reintroduce a percentile to make a screenshot more shareable.

### Sharing a before-and-after

Not built, and worth a deliberate decision rather than drift. Sharing a *score*
is ruled out — the competitors' viral loop is built on sharing a rank, which is
the framing Guideline 1.2 targets and which this product does not produce.
Sharing your own before-and-after is a different thing and may be defensible.
Decide it on its own terms, with the compliance section open.

### Noise floors are guesses

`NOISE_FLOOR` decides whether a change counts as progress or as noise, and the
current values are conservative guesses rather than measurements. The
calibration study in `docs/norms.md` is what would ground them. Until then, they
are deliberately set high: calling a real change "held" disappoints, calling
noise "improved" destroys trust.

### Skin analysis

**Deferred out of V1 2026-09-08.** Unblocked when any of these becomes true:

- A hosted vendor commits in writing to an EU-hosted processing option, a DPA
  with standard contractual clauses, an explicit no-training-reuse clause, and
  one stated retention period for the skin-analysis endpoint. Perfect Corp is
  the only self-serve candidate; its privacy policy currently satisfies none of
  the four.
- Or a maintained, permissively licensed on-device model covers the seven
  metrics. Nothing did as of the research date, and this space moves — re-check
  periodically rather than assuming the answer is still no.

Full assessment in `skin-analysis.md`. `skin.py` stays provider-agnostic so this
drops in without touching the scoring layer.

### Sentry source-map upload

The `@sentry/react-native/expo` config plugin was removed because it runs
`sentry-cli` during the native build and hard-fails without an organisation,
taking `xcodebuild` down with it. The SDK is still a dependency and initialises
at runtime. Re-add the plugin in Faz 5 once a Sentry org and project exist — the
`TODO(faz-5)` is in `app.config.ts`.

### The name

`Ayna` is decided and the identifiers are frozen from first store submission
onward. Parked only in this sense: if Turkish store search proves unworkable
after launch, a rename means a new app listing rather than an update. Revisit
only with post-launch search data, not on intuition. See `product.md` section 6.

### Weekly billing in Turkey

Turkey leads with annual because the 14-day right of withdrawal under Law 6502 is
longer than a weekly billing cycle. If a clean, explicitly captured waiver at
purchase turns out to be workable in practice, weekly becomes available in Turkey
too — it is the higher-revenue option. Needs a lawyer, not a product decision.

### Android

Never built. `expo run:android` has not been run once, so treat the first Android
build as unproven work rather than a formality.

### End-to-end tests

Maestro is named in `architecture.md` and not set up. The consent flow and the
capture quality gate are the two paths most worth covering, because both are
correctness-critical and both are easy to break silently.

### The `seo-analyzer` agent

Installed but unused — it has `WebFetch` without `WebSearch`, so it audits an
existing site rather than researching a market. Useful once there is a marketing
site to audit. Not useful before that.

---

## Ruled out — do not reopen without new evidence

### Any social or comparison layer

No leaderboard, no ranking against other users, no shareable rank card, no
percentile framed as "you beat 74% of men". App Store Guideline 1.2 permits
removal **without notice** for apps used primarily for "objectification of real
people". Percentiles exist internally to normalise a measurement and are never
presented as a scoreboard.

This is the single most likely growth idea someone will propose. It is also the
one that can remove the app from the store overnight.

### An LLM scoring the face

The score is deterministic geometry. The category's top review complaint is that
the same photo produces a different number on each upload, and Guideline 1.1.6
explicitly says calling a feature "for entertainment purposes" does not excuse
its unreliability. The LLM writes recommendation copy from the metric table and
never sees the image.

### Inferring demographics from the image

Age and sex come from the user's profile. The EU AI Act prohibits inferring
demographic attributes from biometric data as of December 2026, and an early
architecture sketch's ethnicity-based normalisation is dead. Do not add a model
that predicts an attribute from a face.

### Subculture vocabulary

PSL, mogging, ascension, tier labels, mewing, and their Turkish equivalents —
"kaçıncı ligdesin", "çekicilik puanı", "güzellik puanı". Screened by
`policy_violations()` and covered by tests. Ranking for these terms would tie the
product to exactly the criticism `market.md` documents.

### Users under 18

18+ only, enforced in the age gate, in a database check constraint, and in the
store rating. The documented harm in this category is concentrated in teenagers,
and their biometric data carries a materially heavier regulatory burden.

### The Medical App Store category

Guideline 1.4.1 requires medical apps to disclose data and methodology supporting
any accuracy claim, and Apple surfaces regulated medical-device status on the
listing. That bar assumes the clinical claim the product deliberately excludes.
Health & Fitness is the category. See `store-listing.md`.

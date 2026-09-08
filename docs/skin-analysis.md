# Skin analysis: buy versus build

Researched 2026-09-08. **Decision: skin analysis is deferred out of V1.**

No hosted vendor could produce both a skin-tone-stratified accuracy report and
the data-handling commitments our legal position requires, and the 2024 KVKK
amendment means sending images to a foreign processor needs signed safeguards
rather than a consent checkbox. Building on-device is not a V1 timeline. So V1
ships front and side geometry plus the routine, and skin follows.

**No code was removed to implement this.** The metric catalogue keeps the seven
skin definitions, `skin.py` keeps raising `NotImplementedError`, and the scoring
layer already handles a group with no data: `build_sub_scores` skips a group
whose metrics are all absent, and `combine` renormalises the weights over the
groups actually present. Skin returns by implementing `skin.py`, not by
re-deriving the contract.

## The cost, measured

Deferring skin is not a free scope cut. Measured against the real scoring code,
with every metric held at the 50th percentile:

| Scenario | Today | Reachable | Gap |
| --- | --- | --- | --- |
| With skin | 50.0 | 55.9 | **5.9 points** |
| Without skin | 50.0 | 52.9 | **2.9 points** |

Only four mutable metrics survive without skin — `eye_aspect_ratio`,
`jawline_definition`, `lip_fullness_ratio`, `submental_cervical_angle` — and all
four are `slow`. **No `responsive` metric remains**, because every one of them
was skin.

Our own `gapCopy()` renders a 2.9-point gap as *"mostly consistency, not
change"*. That is honest, and it is a much weaker product story than the
`68 → 79` headline in `docs/product.md`. Anyone picking this up should know that
V1 without skin sells progress tracking, not transformation — and should not
write marketing copy that promises otherwise. This document records what
the research found, not a settled choice.

Seven skin metrics are in the V1 scope: acne density, redness, dark circles, pore
visibility, texture uniformity, oiliness, hyperpigmentation. They matter
disproportionately because nearly all of a user's *reachable* score gain lives in
skin — bone geometry is fixed. See `docs/product.md`.

`services/api/app/analysis/skin.py` is written provider-agnostic on purpose, so
the decision below is reversible in code even if it is expensive in contracts.

## The headline: every hosted vendor is an unaudited black box on the two axes we care about

No vendor evaluated publishes **either** a skin-tone-stratified accuracy report
for their consumer skin-analysis product, **or** a complete set of the
data-handling commitments our legal position requires. Not one.

## Vendor assessment

| Vendor | Self-serve for a small team | Pricing published | Stated image retention | Training reuse addressed | EU residency option | DPA located |
| --- | --- | --- | --- | --- | --- | --- |
| Perfect Corp (YouCam) | Yes, with a free test allowance | **No — the pricing page returned nothing on a direct fetch** | Inconsistent across its own policy: 1 hour in one clause, 24 hours in another | **Not addressed at all** | No selectable option; AWS Tokyo / Ireland / Oregon, and the policy says data may be transferred to the US | Not found in the policy |
| Haut.ai | Docs and Swagger are public; pricing is sales-assisted | No — "available upon request" | Contract-tied; minimum 24 hours on the paid tier, client-configurable deletion | Not found | Not found | Processor role and GDPR compliance stated; DPA text not located |
| Orbo.ai | Pricing on request; unclear | No | 24-48 hours | Not found | Not specified | Controller/processor framing implied; no document found |
| Revieve | **No** — demo booking only | No | Not found | Not found | Not found | DPA explicitly referenced in the ToS |
| Meitu | Enterprise only | No | Not found | **Yes — policy states facial feature information may be used "for internal research purposes"** | **No — mainland China, and the policy itself notes there is no EU adequacy decision for the PRC** | Not confirmed |
| ModiFace (L'Oréal) | Unconfirmed, likely enterprise only | No | Not found | Not found | Not found | Not found |

**Meitu is eliminated outright**, not merely ranked last: its own privacy policy
combines China-hosted processing with explicit biometric reuse for internal
research. That cannot be reconciled with GDPR Art. 9 or the post-2024 KVKK
transfer regime.

**Revieve and ModiFace are unavailable** to a team our size regardless of
technical merit.

A figure of roughly $0.041 per unit circulates for Perfect Corp in secondary
blog aggregations. It **could not be confirmed** against Perfect Corp's own
pricing page, which rendered nothing on a direct fetch. Do not budget against it.

## Build: not a V1 option, and the reason is data, not modelling

There is no maintained, permissively licensed, production-grade on-device model
covering the seven metrics.

- **MediaPipe Selfie Segmentation** isolates the skin region and nothing more. It
  detects no skin condition. Useful as pre-processing, not a solution.
- The acne detectors on GitHub with MIT licences are student and hobby projects
  with no stated dataset size, validation method or accuracy. A fine-tuning
  starting point at best.
- **Fitzpatrick17k**, the most-cited open dermatology dataset with skin-tone
  labels, is licensed for **non-commercial use only**, and it classifies disease
  categories rather than the cosmetic attributes we need.

So the build path is a real ML project: fine-tune a MobileNetV3-class backbone on
a skin-tone-diverse dataset we would have to license or collect ourselves — and
collecting it brings its own consent regime. The long pole is the data, not the
architecture.

## Skin-tone bias is a live risk for a Turkish and mixed audience

A 2025 npj Digital Medicine study found an ITA-based skin-tone classifier scored
0-20% accuracy against the Fitzpatrick scale versus 89-92% against the Monk Skin
Tone scale, with a highly significant lighter-versus-darker accuracy gap on
Fitzpatrick. That study measured *skin-tone classification itself*, not
downstream acne or pigmentation detection, so it does not transfer directly to
our seven metrics — but the broader pattern of colour-bias degradation in skin
models is confirmed across several independent sources.

The practical point stands: a model that works on one skin tone and not another
is worse for us than no model, because a wrong skin sub-score corrupts the
reachable projection that the whole product rests on.

## Options

1. **Pilot Perfect Corp behind the provider-agnostic layer**, but only after
   getting three things in writing: a DPA with SCCs, an explicit no-training-reuse
   clause, and a single retention period for the skin-analysis endpoint. The
   marketing page's compliance claims are not backed by the privacy policy on any
   of these three points.
2. **Defer skin analysis out of V1.** Ship front and side geometry plus the
   routine, add skin later. Costs the product its largest source of reachable
   gain and weakens the paywall, but removes the cross-border transfer problem
   entirely from the first release.
3. **Build on-device.** Resolves the legal constraint completely and permanently.
   Not a V1 timeline, and the dataset is the blocker.

## What would change the picture

- Any vendor putting EU-hosted processing, a signed DPA, a no-training-reuse
  clause and one stated retention period in writing.
- Verified pricing from a live Perfect Corp account. If the real per-call cost is
  materially above the unconfirmed figure, the free-first-scan economics change.
- A maintained, permissively licensed on-device model covering the seven metrics.
  This space is moving; re-check periodically.
- KVKK Board guidance specific to biometric or skin-image processing in consumer
  apps. None of the sources found addressed this use case directly.

## Sources

- https://yce.perfectcorp.com/ai-api/products/skin-analysis-api
- https://www.perfectcorp.com/business/privacy
- https://docs.saas.haut.ai/haut.ai/legal/legal
- https://www.orbo.ai/privacy/
- https://www.revieve.com/company/terms-of-service
- https://corp.meitu.com/privacy_en.html
- https://www.nature.com/articles/s41746-025-01770-4
- https://www.sciencedirect.com/science/article/pii/S0169260724000403
- https://www.nature.com/articles/s41746-024-01176-8
- https://practicaldermatology.com/topics/skin-of-color/ai-and-skin-of-color-hidden-biases-raise-questions/23994/
- https://github.com/mattgroh/fitzpatrick17k
- https://istanbullawyerfirm.com/blog/kvkk-cross-border-data-transfers-standard-contracts-notification-guide-2025
- https://ccs.law/post/analysis-of-turkey-s-updated-cross-border-data-transfer-regulations-under-kvkk/

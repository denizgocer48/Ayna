# Pricing benchmarks and open decision

Researched 2026-09-08. Status: **decision pending.**

Prices marked "live fetch" were read from the App Store listing itself on that
date. Everything else is flagged. App pricing moves constantly — re-verify before
committing, and note that the lira depreciated roughly 17.5% over the trailing
twelve months, so every TRY figure is a snapshot rather than a stable reference.
FX reference used: 1 USD ≈ 48.46 TRY.

## What competitors actually charge

| App | Market | Weekly | Monthly | Annual | Verified |
| --- | --- | --- | --- | --- | --- |
| Umax | US | $3.99 / $4.99 / $9.99 | $9.99 / $12.99 / $24.99 | — | Live fetch |
| Umax | Turkey | ₺129.99-₺299.99 | ₺299.99-₺799.99 | — | Live fetch |
| Aesthetica | US | $3.99 | $9.99 | $29.99 (also $49.99 lifetime) | Live fetch |
| Chadmax | US | $4.99 | — | $29.99 | Live fetch |
| Headspace | Turkey | — | ₺34.99-₺142.99 | ₺249.99 | Live fetch |
| BetterMe | Turkey | ₺63.99 | ₺50.99-₺349.99 | ₺144.99-₺219.99 | Live fetch |
| LooksMax AI | US | — | — | $39.99 | Secondary source only |
| YouCam Makeup | Global | — | $5.99 | $29.99 | **Stale — source data is from late 2023** |
| TroveSkin | — | — | — | — | **No price found at all** |

Multiple SKUs on one listing usually mean historical or A/B-test prices sitting
alongside the live one, not a single current price.

## The finding that matters most: Umax's free scan is not free

Umax performs the scan for free and then **blurs the result until payment**.
Reviewers also report per-scan charges on top of a weekly subscription.

That is value shown and withheld, not value delivered. Our model — first scan
fully scored, paywall on the breakdown, the routine and repeat scans — is
genuinely more generous than the category leader's. Two consequences:

1. It is a real differentiator and the store copy should say so plainly.
2. It also means we should expect conversion nearer the freemium end of published
   benchmarks than the hard-paywall end. Plan revenue accordingly.

## Weekly billing: the norm, and a positioning problem

Weekly subscriptions produced 55.6% of all app revenue in 2025, up from 43.3%
two years earlier, while monthly's share fell from 21.1% to 11.7% (Adapty 2026).
All three verified face-analysis competitors lead with weekly.

But note the split:

- **Looksmaxxing apps** (Umax, Chadmax, Aesthetica) lead with weekly.
- **Wellness apps** (Headspace, BetterMe) lead with monthly and annual.

Ayna sits between the two: a face-analysis mechanic with a skincare-routine
framing. **The billing period is therefore a positioning decision, not only a
revenue one.** Leading with weekly maximises revenue and aligns us with the
category we have spent `docs/market.md` deliberately distancing ourselves from.

## Turkey: weekly billing has a specific legal problem

Law No. 6502 grants a **14-day right of withdrawal** on distance contracts,
including digital subscriptions, unless the consumer explicitly waives it for
immediately-consumed digital content.

**That window is longer than an entire weekly billing cycle.** Without a clean,
explicitly captured waiver at the point of purchase, weekly billing in Turkey
carries real refund-and-dispute exposure. A new Turkish advertising and
e-commerce regulation also took effect 1 August 2026, tightening digital
marketing and discount disclosure.

Circumstantial but on-point: YouCam Makeup has a visible cluster of Turkish
consumer complaints about a "free trial" converting into a large unexpected
charge. Single complaints are weak evidence; a cluster in exactly our adjacent
category and market is worth weighing.

## Regulatory pressure is rising on the flow, not the period

- The FTC revived Click-to-Cancel rulemaking in 2026 after the prior rule was
  struck down in 2025, and ROSCA enforcement continues.
- EU regulators treat manipulative subscription-flow design as a standalone
  Unfair Commercial Practices Directive violation, and count taps-to-subscribe
  against taps-to-cancel.
- Apple tightened 2026 review to require full price, renewal and cancellation
  terms shown before payment, with reviewers manually testing the flow.

None of this bans weekly billing. All of it targets how the offer is presented.

## Two published benchmarks contradict each other — do not plan on either

- RevenueCat (2026): hard paywall Day-35 trial-to-paid **10.7%** versus freemium
  **2.1%**.
- Adapty (2026): soft paywall **4.85%** versus hard paywall **3.34%** at
  paywall-view-to-payment.

Different funnel stages and different samples, so not a clean contradiction — but
they point in opposite directions in the same year. Neither is a planning number.
A/B test our own funnel.

One benchmark that is useful regardless: **82% of trials start on day zero.**
Whatever first-value moment we deliver has to land in the install session.

## Purchasing power: trust observed prices over PPP formulas

A pricing-localisation vendor claims Turkish prices should sit ~71% below US
baseline. Observed live pricing does not support that: Umax's Turkish tiers are
roughly 30-45% below its US tiers, not 71%. The vendor also sells localisation
tooling. Trust the observed competitor pricing.

## Proposed structure (not yet decided)

**English-speaking markets**

- Weekly $6.99 — above Umax's $3.99 floor and Chadmax's $4.99, justified because
  we gate more real utility than a single vanity score.
- Annual $49.99-$59.99, shown on the same primary screen as "best value".
- Monthly $16.99-$19.99, demoted to a secondary screen.

**Turkey**

- Weekly ₺179.99-₺199.99, inside Umax's observed band.
- Annual ₺899.99-₺1,199.99.
- Monthly ₺399.99-₺449.99, demoted.
- Do not lead with an unlabelled free trial on a weekly plan. Prefer a clearly
  labelled paid intro week, an in-app cancel path, and prominent annual pricing.
- Re-price on a monthly cadence. A static TRY price silently erodes in USD terms.

## Risks

1. Weekly billing exposure is rising in both the US and EU, aimed at flow design.
2. Turkey's 14-day withdrawal right is structurally longer than a weekly cycle.
3. Apple's tightened disclosure review is a store-approval risk, not only legal.
4. Photo and video trial-based apps show refund rates up to 14.1% in some regions.
5. Category association: weekly billing on a product used once is exactly what
   the press criticises about looksmaxxing apps.
6. Turkish benchmark data is thin — one verified comparable. Validate with a soft
   launch rather than treating the numbers above as benchmark-grade.

## Unverified — re-check before use

"Weekly converts 5.4x better than annual" (no primary source found) · LooksMax AI
$39.99/year (secondary only) · QOVES ~$150 (approximate in the source itself) ·
YouCam global pricing (2023 data) · YouCam Turkey pricing (two contradictory
figures) · TroveSkin (nothing found) · the 71% PPP claim (vendor blog,
contradicted by observation).

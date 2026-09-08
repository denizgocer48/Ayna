# Market and competitive intelligence

Researched 2026-09-08. Every claim below has a source. Where a source is not
neutral — several "comparison" sites in this space are content marketing run by
competitors — that is flagged inline.

Read this before arguing for a change to positioning, scoring or the paywall.
Most of those arguments have already been run as experiments by someone else,
in public, with documented outcomes.

## The category is proven, profitable, and under attack

Umax is the reference point. Over 7 million downloads, and reported subscription
revenue of roughly $500k/month in 2024, still around $350-400k/month in January
2026. Fortune noted it could not independently verify the revenue figure, so
treat it as directional. Pricing is $3.99/week.

- https://fortune.com/2024/07/01/looksmaxxing-apps-rate-teen-boys-faces-mental-health/
- https://www.techmeme.com/240701/p21

So demand is real and people pay. The rest of this document is about why that is
not the same as this being a safe category to enter.

## The single biggest product failure: scores that move

This is the most useful finding in the whole research pass, and it is the reason
`docs/product.md` insists on deterministic geometry.

Across App Store reviews and comparison writeups, the loudest recurring complaint
is that the same photo produces a different score on each upload. Users report
submitting an identical picture three times and getting three different numbers.
Re-scanning is itself monetised — one report says a re-scan costs another $3.99,
which turns the app's own inconsistency into a revenue line and reads as a scam
to the user.

- https://justuseapp.com/en/app/6471026798/umax-maximize-your-looks/reviews
- https://realworldappeal.com/en/blog/umax-vs-looksmax-ai (competitor-affiliated, treat as directional)
- https://www.youtube.com/watch?v=LgRluxqgUXg ("This Looksmaxxing App Is A Huge Scam")

**Implication for us.** Reproducibility is not a nice engineering property here,
it is the product's only defensible claim. Our scoring runs on landmark geometry
with a hard capture-quality gate precisely so the number does not wander. If we
ever ship a score that moves between two photos in one session, we are just
another entry in the list above.

## Apple has written this category into the guidelines

Two guidelines matter, and they cut in opposite directions on the same design.

**Guideline 1.2** names our category almost by name:

> Apps with user-generated content or services that end up being used primarily
> for ... objectification of real people (e.g. "hot-or-not" voting) ... do not
> belong on the App Store and may be removed without notice.

**Guideline 1.1.6** closes the usual escape hatch:

> False information and features, including inaccurate device data or trick/joke
> functionality ... Stating that the app is "for entertainment purposes" won't
> overcome this guideline.

- https://developer.apple.com/app-store/review/guidelines/

Read together: a face-scoring app cannot defend an unreliable score by calling
itself entertainment, and cannot present itself as a rating-people product. Apple
also expanded the objectionable-content list in February 2026 and tightened rules
on low-quality apps in June 2026.

- https://www.mactech.com/2026/02/06/apple-updates-its-app-review-guidelines-with-expanded-list-of-apps-with-objectionable-content/
- https://www.macrumors.com/2026/06/09/app-store-guidelines-low-quality-apps/

**Implication for us.** The self-scan framing (you measuring yourself, no voting,
no leaderboard, no comparison between users) is what keeps us outside 1.2. That
is a permanent constraint, not a launch tactic. Never add a social ranking
feature to this product.

## Age ratings were overhauled — our compliance doc was out of date

Apple replaced 12+ and 17+ with 13+, 16+ and 18+. Every app had to complete a new,
more detailed age-rating questionnaire by 31 January 2026; apps that have not
done so are blocked from new submissions and updates. The new questionnaire adds
mandatory questions covering, among other things, medical or wellness content —
directly relevant to a skincare and grooming app.

- https://developer.apple.com/news/?id=ks775ehf
- https://www.macobserver.com/news/apple-adds-new-app-store-age-ratings-13-16-and-18/
- https://techcrunch.com/2025/07/25/apple-broadens-app-stores-age-rating-system

`docs/compliance.md` previously said 17+. That tier no longer exists. We target
18+, which matches the age gate already enforced in the database.

## EU AI Act: a hard line we must not cross

The AI Act prohibits using AI to categorise people individually on the basis of
their biometric data in order to infer race, ethnicity, political opinions, trade
union membership, religious or philosophical beliefs, sex life or sexual
orientation. That prohibition takes effect December 2026. Full obligations for
standalone high-risk biometric systems were pushed to 2 December 2027 by the
July 2026 Digital Omnibus.

- https://fpf.org/blog/red-lines-under-the-eu-ai-act-understanding-the-prohibition-of-biometric-categorization-for-certain-sensitive-characteristics/
- https://www.euai-act.com/articles/biometric-ai-compliance
- https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai

**Implication for us, and it is already in the design.** Age and sex are taken
from the user's own profile, never inferred from the image. `metric_norms` is
keyed on self-declared `sex` and birth year. Do not add ethnicity as a
normalisation dimension, and do not add any model that predicts a demographic
attribute from a face. An early architecture sketch in this project mentioned
ethnicity-based normalisation; that idea is dead and should stay dead.

This also means an EU launch needs a lawyer to confirm whether we fall under the
AI Act's transparency obligations for biometric systems. Budget for that review
before an EU release, not after.

## The reputational risk is the real risk

The category is under sustained criticism from clinicians and researchers, and
the criticism is specific rather than vague.

Researchers analysing these apps identify three mechanisms of harm: **quantification**
(reducing self-worth to an AI score), **gamification** (using incel terminology
such as the PSL 1-8 scale and labels like "low-tier normie"), and **reframing**
(selling "recipes for ascension" while keeping a fatalistic worldview underneath).
The same work documents users receiving suicide-encouragement replies and
engagement between category influencers and profiles celebrating a mass murderer,
and describes a radicalisation pipeline into extremist incel communities.

- https://theconversation.com/how-looksmaxxing-self-improvement-apps-are-marketing-misogyny-to-young-men-276174

Clinicians link the trend to body dysmorphia and disordered eating in teenage boys.

- https://www.hopkinsmedicine.org/news/articles/2026/08/looksmaxxing-trend-poses-risks-for-boys-and-teens
- https://www.psychologytoday.com/us/blog/meaningfull/202604/looksmaxxing-self-improvement-can-turn-into-self-rejection

**Implication for us.** Three product rules follow directly, and they are cheap
to hold if we decide now:

1. **No PSL scale, no tier labels, no incel vocabulary anywhere** — not in the
   UI, not in marketing copy, not in the recommendation text the LLM generates.
   Add these terms to a blocklist alongside the existing `FORBIDDEN_TOPICS`.
2. **No comparison between users.** No leaderboard, no percentile framed as
   "you beat 74% of men", no shareable rank card. Percentiles exist internally to
   normalise a measurement; they are not a scoreboard.
3. **The 18+ gate is a product feature, not a legal chore.** The documented harm
   is concentrated in teenagers. Serving adults only removes most of the
   reputational exposure and all of the "app that harms kids" headline risk.

## The female / skin-analysis side of the market

The looksmaxxing category is male-skewed and incel-adjacent. The skin-analysis
category — Perfect Corp's YouCam line and similar — is female-skewed, far older,
better funded and positioned entirely differently: skincare diagnostics and
product recommendation rather than facial rating.

Our decision to serve a mixed 18-35 audience puts us between two established
positions. That is defensible, but it means two messaging tracks and two sets of
store screenshots, not one. See `docs/product.md` section 2.

## Three competitors, one template

Reviewed September 2026: Hiface, LooxUP and LooksMax AI run near-identical
funnels — overall score, category breakdown, a potential-score gap, then a daily
routine. LooksMax AI has over 10 million downloads and 1.2 million ratings at
3.99 stars, with Pro at $9.99/week or $29.99/month.

The technical stack is the same one we built: on-device MediaPipe landmarks,
geometric measurements, then an LLM turning numbers into readable advice. That
part is not a differentiator and never was.

What they do that we will not is recorded in `docs/product.md` section 8:
ranking users against each other ("Top 15% of men"), share buttons under the
score, a masculinity index, and mewing in the routine.

One claim we could not verify: that LooxUP takes payment on the web to avoid
store commission. Its own landing page describes a three-day trial cancelled
through device settings, which is store billing. A separate web funnel may exist,
but nothing on the site evidences it — do not build a strategy on it without
better sources.

## Naming: "Ayna" is a problem

`Ayna` means mirror in Turkish. The Turkish App Store already contains multiple
apps with that exact name, most of them literal mirror or makeup-mirror utilities,
including one called "Ayna AI":

- https://apps.apple.com/tr/app/ayna-tam-ayna/id1580277782
- https://apps.apple.com/tr/app/ayna-makyaj-ve-g%C3%BCzellik/id1546660150
- https://apps.apple.com/us/app/ayna-ai/id6755056377
- https://apps.apple.com/tr/app/ger%C3%A7ek-ayna-true-mirror/id582877764

Two separate problems:

1. **Discoverability.** Searching "ayna" in the Turkish store returns a wall of
   mirror utilities. We would be competing for our own brand term against apps
   that have nothing to do with us, and we would lose — they match the query
   literally.
2. **Meaning.** A mirror shows you what is already there. The entire product
   thesis is the opposite: measurement plus a projection of what changes. The
   name argues against the positioning.

Naming criteria that fall out of this research:

- Must not contain `max`, `looks`, `mog`, `PSL`, `rate`, `hot` — every one of
  those is category vocabulary that ties us to the criticism above and to
  Guideline 1.2.
- Must be searchable: not a common Turkish or English noun that generic
  utilities already own.
- Should carry measurement, calibration or baseline, not reflection or beauty.
- Must work spoken in both Turkish and English.

`ayna` is currently hardcoded as the Expo `slug`, the URL scheme, the bundle
identifier `com.ayna.app`, the npm workspace names and the repo name. Changing it
is a half-day of mechanical work while the project is pre-launch, and effectively
impossible after the first store submission. **Decide the name before Faz 1
ends.**

## What I would tell a new entrant

1. **Ship a score that does not move.** It is the one thing every incumbent gets
   wrong, it is the top complaint in their reviews, and it is a solvable
   engineering problem rather than a marketing one.
2. **Never let the app rank people against each other.** Guideline 1.2 allows
   removal without notice, and the press criticism attaches to exactly that
   framing.
3. **Be honest about what cannot change.** The incumbents sell "ascension". Bone
   geometry does not move. Saying so out loud is both true and, in this market,
   differentiating.
4. **Adults only.** The harm evidence, the regulatory exposure and the headline
   risk are all concentrated in minors.
5. **Assume an EU legal review is a launch dependency**, not a formality — the
   AI Act biometric provisions land in December 2026.

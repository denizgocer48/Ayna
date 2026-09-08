# Ayna documentation

Start at the top. The first two answer "what is this and where is it", the rest
answer "why is it built this way".

| Document | What it is |
| --- | --- |
| [handoff.md](handoff.md) | **Read first.** Current status, environment traps, what is real versus placeholder, and the next task in order. |
| [backlog.md](backlog.md) | Parked decisions to revisit deliberately, and decisions ruled out that should not be reopened without new evidence. |
| [product.md](product.md) | The decisions the whole build rests on: the two-number score, the audience, the paywall model, the V1 scope, the name, the market. |
| [architecture.md](architecture.md) | How a scan flows from camera to score. Why analysis is a separate queued service. |
| [compliance.md](compliance.md) | The constraints that are legal requirements rather than preferences. Read before touching photos, consent or scoring. |
| [roadmap.md](roadmap.md) | What each `TODO(faz-N)` marker in the code means, phase by phase. |

## Research

Findings from the 2026-09-08 research pass. Each records its sources, and flags
what could not be verified rather than smoothing over it.

| Document | What it answers |
| --- | --- |
| [market.md](market.md) | What the incumbents got wrong, what App Store guidelines govern this category, and the product rules that follow. |
| [skin-analysis.md](skin-analysis.md) | Buy versus build for skin metrics, vendor by vendor. Why skin is deferred out of V1, and what that costs, measured. |
| [pricing.md](pricing.md) | What competitors actually charge, verified from live listings. Why the billing period differs between Turkey and English markets. |
| [norms.md](norms.md) | Whether a percentile can be grounded at all. Which metrics have published reference distributions, which have none, and the unvalidated link between MediaPipe output and the anthropometric literature. |
| [store-listing.md](store-listing.md) | App Store and Play metadata, ready to paste, with character and byte counts. Category choice and its reasoning. |

## How to read these

Every research document separates **what was verified** from **what could not
be**. Figures marked unverified are exactly that — do not promote one to fact by
quoting it somewhere else without re-checking.

Where a document states a rule in bold, it is usually encoded somewhere: a check
constraint, an RLS policy, a blocklist, or a test. Changing the rule means
changing that too.

# Store listing metadata

Researched 2026-09-08. Ready to paste into App Store Connect and Play Console.

Verify every character and byte count in the console before submitting — both
consoles reject overflow directly, so this check is free.

## The rule that governs everything here

**Never ship a listing whose visible name is the bare word "Ayna".** The Turkish
App Store already holds several literal mirror and makeup utilities using that
exact word, plus an app called "Ayna AI". We cannot win that query and should not
spend effort trying. The title carries the keywords; the brand carries the
identity. See `docs/product.md` section 6.

## App Store (iOS)

### Turkish

| Field | Limit | Value | Count |
| --- | --- | --- | --- |
| Title | 30 chars | `Ayna: Yüz, Cilt Bakım Takibi` | 28 |
| Subtitle | 30 chars | `Ölçüm, Analiz, Rutin Skoru` | 26 |
| Keywords | 100 **bytes** | `simetri,oran,akne,sivilce,leke,gözenek,kırışıklık,sakal,tıraş,erkek,kadın,günlük,nem` | ~95 bytes |

### English

| Field | Limit | Value | Count |
| --- | --- | --- | --- |
| Title | 30 chars | `Ayna: Skin & Grooming Progress` | 30 |
| Subtitle | 30 chars | `Facial Measurement & Routine` | 28 |
| Keywords | 100 bytes | `score,tracker,acne,wrinkle,pores,symmetry,proportion,men,beard,shave,skincare,diary,scan,glow,jaw` | 97 bytes |

**The keyword field is 100 bytes, not 100 characters.** Turkish diacritics
(ç ğ ı ö ş ü and their capitals) cost 2 bytes each in UTF-8, ASCII letters cost
1. A Turkish keyword string therefore hits the ceiling roughly 15-20% sooner than
an English one of the same visible length. Counting characters will overflow.

Do not repeat words already present in the title or subtitle. Apple indexes
name + subtitle + keywords together, so a repeat wastes budget that could buy a
new term.

Note that the keyword lists above include acne, pores and wrinkle terms. Skin
analysis is deferred out of V1 (`docs/skin-analysis.md`), so **strip those terms
from the V1 submission** and restore them when skin ships — ranking for a
capability the app does not have earns one-star reviews and edges toward
Guideline 1.1.6.

## Google Play

Play indexes the **full 4,000-character description**; iOS does not index its
description at all. So the effort that goes into the iOS keyword field has to go
into natural-language sentences here instead. Do not paste a comma list into a
Play description — it reads as spam and Play's quality signals penalise it.

Play also clusters semantically related queries rather than weighting literal
title matches as heavily as Apple does, which means **the "Ayna" collision costs
us less on Play**. Spend the brand-defence effort on iOS.

### Turkish

| Field | Limit | Value | Count |
| --- | --- | --- | --- |
| Title | 30 chars | `Ayna: Cilt ve Bakım Takibi` | 26 |
| Short description | 80 chars | `Yüz ölçümü ve cilt analiziyle gerçek ilerlemeni takip et, rutinini oluştur` | 74 |

Opening of the full description — the first ~150 characters carry the most weight
and are what shows before "read more":

> Ayna, yüzünü ölçer ve sana ulaşılabilir bir hedef gösterir. Bakım rutinini
> oluştur, ilerlemeni gerçek verilerle takip et — tahminle değil.

### English

| Field | Limit | Value | Count |
| --- | --- | --- | --- |
| Title | 30 chars | `Ayna: Skin & Grooming Tracker` | 29 |
| Short description | 80 chars | `Track real skin & grooming progress with facial measurement and a routine plan` | 78 |

> Ayna measures your face, not your opinion of it. Get today's score and a
> reachable target, build a grooming routine, and track what is actually
> changing — with a score that does not move between two photos of the same face.

That last clause is the differentiator. The category leader's top review
complaint is that the same photo scores differently each upload
(`docs/market.md`). Say so.

## Category

**Health & Fitness as primary on both stores. Lifestyle as the iOS secondary.**

Every comparable app sits in Health & Fitness — the closest Turkish competitor
(Charm) is in Sağlık ve Fitness, as are the English skincare trackers.

**Do not choose Medical.** Guideline 1.4.1 requires medical apps to disclose data
and methodology supporting any accuracy claim, and Apple now surfaces regulated
medical-device status on the listing itself. That category's entry bar assumes
exactly the clinical claim we have deliberately excluded from the product.

Lifestyle alone would be uncontested but poorly qualified — users there are not
searching with tracking intent. It earns the free second iOS slot, not the
primary one.

On Play, use the five available tags for the Lifestyle-adjacent discoverability
we are not spending a category slot on. Google's own guidance is to pick only
strongly associated tags rather than maximising spread.

## Screenshots

Apple's OCR reads text overlaid on the first screenshots as a ranking signal.
Controlled testing suggests the lift is small, but it is free: put
`Cilt ve Bakım Takibi` and `Skin & Grooming Progress` as captions on the first
screenshot of each locale.

Per `docs/compliance.md`, screenshots show the routine and progress views — never
a number over a face.

## Keywords we are refusing, and what that costs

"Looksmaxxing" carried roughly 301,000 monthly Google searches as of March 2026,
more than three times the next term in its family, and TikTok logged 300k-1.9M
related searches per day at its early-2026 peak. That is web and social volume
rather than App Store volume, but it is the best available proxy for the size of
the demand pool the vocabulary taps.

We refuse it, along with "rate my face", "am I attractive", "beauty score" and
"güzellik puanı" / "çekicilik puanı". The first two sit squarely in Guideline 1.2
territory; the rest contradict our own positioning rule.

**What we are refusing is the vocabulary, not the audience.** The same user need —
facial measurement, progress tracking, routine building — is fully addressable
through the compliant terms above. The cost is discovery efficiency, and it is
bounded and describable rather than unknown.

## Turkish subculture terms

The Turkish-language mutations of this vocabulary ("kaçıncı ligdesin", "hangi
tier'desin", "çekicilik puanı") do not appear if you screen only for the English
terms. `SUBCULTURE_TERMS_TR` in `services/api/app/analysis/recommendations.py`
covers them, including the dotted/dotless i problem that lets upper-cased Turkish
slip past naive case-insensitive matching.

# Reference distributions: what exists, and what does not

Researched 2026-09-08. **This is the most consequential research finding in the
project so far, and it is unwelcome.** Read it before writing any code that
prints a percentile in front of a user.

## The short version

The product converts a raw measurement into a percentile against a reference
population. That step needs a published mean and standard deviation, per sex,
per age band, for each metric. Two problems:

1. **Around a third of our metrics have no usable published norm at all** — not
   a weak one, none. Several are aesthetic canons rather than measured
   distributions.
2. **No study validates MediaPipe's landmark output against caliper or
   cephalometric ground truth.** The photogrammetry literature validates *manual*
   landmark placement by a trained examiner. MediaPipe is a regression model with
   its own error distribution, documented by Google in terms of vertex accuracy
   on 3D reconstruction benchmarks — not in terms of the anthropometric
   distances and angles we compute from it. This link has not been established.

Together those mean a percentile printed today would be a number derived from an
unvalidated pipeline compared against norms that, for several metrics, do not
exist. `docs/compliance.md` already notes App Store Guideline 1.1.6 rejects
"false information and features" and says calling something entertainment does
not excuse it. This is precisely that exposure.

## Metrics with no usable norm

| Metric | Why not |
| --- | --- |
| `eye_aspect_ratio` | The term does not exist in anthropometric literature — it comes from blink detection. The nearest analogue, palpebral fissure height/length, has regional and mostly paediatric data. |
| `facial_thirds_balance` | A 19th-century aesthetic canon, not a measured distribution. When populations are actually measured against it, they do not match. |
| `facial_fifths_balance` | Same. |
| `jawline_definition` | No anthropometric literature whatsoever. The only validated instrument found is a clinician-rated severity scale for dermal filler trials. |
| `chin_projection_ratio` (front) | A profile construct. No validated front-photo version found. |
| `nasofrontal_angle` (front) | Same — inherently a profile measurement. |
| `nasal_dorsum_index` | The literature treats the dorsum categorically (straight / concave / convex), not as a continuous ratio with an SD. |
| `canthal_tilt` | The widely circulated figure traces only to aesthetic-industry blogs restating one another. The claimed primary source could not be located and read. **Treat as unverified.** |
| `ramus_body_ratio` | The two lengths are usually published separately with SDs; the ratio itself is rarely tabulated. |

## Metrics with usable literature

`fwhr` (meta-analysis, n=10,853), `face_length_width_ratio`, `eye_spacing_ratio`,
`nose_width_ratio`, `philtrum_length_ratio`, `lip_fullness_ratio`,
`interpupillary_ratio`, `symmetry_index` (thin, n=100),
`submental_cervical_angle`, `chin_projection_true` (Ricketts/Steiner/Holdaway,
Caucasian-derived), `gonial_angle_true`, `mandible_width_ratio` (partial).

Most are drawn from samples aged roughly 17-35, so age stratification beyond
"young adult" is largely unavailable even where a norm exists.

## A contradiction, not a stale source

Whether the gonial angle differs by sex is genuinely unresolved. One CBCT study
reports males 124.7° versus females 119.6° at p<0.001; a panoramic study reports
127.27° versus 127.08° at p=0.679; a cephalogram study finds no difference. The
disagreement spans imaging modality, age range and population.

Do not encode a sex split for gonial angle. Either treat it as sex-invariant or
carry a wide interval.

## Turkey

Turkish craniofacial studies exist but are small (n=173 and n=187) and restricted
to ages 17-25. **No Turkish age-stratified norm set is available** — only a
snapshot of young adults.

On how much error a European norm set introduces for Turkish users, a 2011
systematic review across 27 ethnic groups (n=2,359) gives the most useful answer,
and it is measurement-dependent:

- **Widths transfer reasonably.** Bizygomatic and intercanthal widths show the
  lowest inter-ethnic variability (CV ≈ 0.04-0.05). Ratios built on them —
  `fwhr`, `mandible_width_ratio`, `eye_spacing_ratio` — are the safest.
- **Soft-tissue angles do not.** Chin projection and E-line norms shift
  substantially by population, in the direction that would misclassify Turkish
  users against a Western reference.
- Forehead height is the most variable of all (CV ≈ 0.10-0.11).

None of this requires inferring ethnicity from a face, which the EU AI Act
prohibits and `docs/compliance.md` rules out. The question it answers is whether
one pooled norm set is defensible, or whether the product needs a coarse
self-reported region the user sets once.

## Datasets

No openly licensed dataset combines manual anthropometric landmarks with sex and
age labels and permits commercial use.

- **FaceBase 3D Facial Norms** is the closest methodological match — 2,454
  subjects, real anthropometric landmarks, ages 3-40, sex-stratified. But it is
  European-ancestry only, requires a data access request, and its commercial
  terms are not stated in the public material. **Confirm directly before relying
  on it.**
- UTKFace, FFHQ, FG-NET, IMDB-WIKI: all non-commercial.
- MORPH-II is commercially licensable but is a mugshot corpus with no manual
  anthropometric landmarks and the demographic composition of a criminal-justice
  dataset.

## Recommended path

**Three buckets, not one.**

1. **Percentile, with the reference population stated.** For the metrics with
   real literature. Cite the specific paper per metric, keep its SD, and be
   explicit in-app about which population and age range the comparison uses.
2. **Reframe, do not invent.** For thirds, fifths, and the other canon-based
   metrics: present as "how close to the classical canon", never as a percentile
   against people. The canon is not a population distribution and saying it is
   would be the false claim Guideline 1.1.6 targets. `jawline_definition` becomes
   a descriptive index, not a rank. Front-view chin projection and nasofrontal
   angle should move to the side capture, where norms exist, or be dropped.
3. **Calibrate before claiming.** A modest study — a few hundred consenting
   users per sex and age band, each measured by our pipeline and by manual
   landmark placement on the same photo — would anchor our MediaPipe output to
   the literature's manually-measured norms and generate SDs where none exist.
   This is what the norm databases themselves did. It runs under the existing
   biometric consent gate.

## Three facts that would change this

1. **Whether the claimed canthal-tilt study exists as described.** If real with
   usable SDs, canthal tilt becomes usable. If not, it has almost no rigorous
   quantitative literature at all.
2. **Whether FaceBase's terms permit deriving commercial percentile logic from
   their published summary statistics.** If yes, several rows above move from
   "partial" to "usable" at a stroke.
3. **Whether any study benchmarks MediaPipe, or a comparable ML landmark model,
   against caliper or cephalometric measurement.** If one exists and shows large
   or non-uniform bias, no literature norm can be applied to our output without a
   correction step — and the calibration study moves from recommended to
   mandatory before any percentile ships.

## What this does not undermine

The measurements themselves. `services/api/app/analysis/metrics.py` is
deterministic, scale-invariant, translation-invariant and rotation-invariant, and
those properties are tested. Measuring the same face twice gives the same
numbers, which is the reproducibility claim and remains true.

What is unsupported is the *comparison* — turning that number into "you are at
the 62nd percentile". Progress against the user's own baseline needs no reference
population at all, and is unaffected by everything above.

"""Normalisation, scoring and the reachable-score projection.

A raw measurement means nothing on its own: a 128-degree gonial angle sits in a
different percentile for a 19-year-old man and a 45-year-old woman. Every metric
is converted to a percentile against a reference distribution selected by age
band and sex, then combined with fixed weights.

Deliberately NOT an LLM. An LLM asked to "rate this face" is not reproducible,
and a score that moves between two photos of the same face in the same session
destroys the product's credibility.
"""

from app.schemas import METRIC_GROUPS, METRIC_META, MetricResult, ScoreBand, SubScore

# Group weights for the overall score. Skin carries less weight than geometry
# because segmentation output is noisier; harmony carries less because it is a
# single metric. Tuned in Faz 2 against a labelled set.
GROUP_WEIGHTS: dict[str, float] = {
    "eyes": 0.20,
    "proportions": 0.22,
    "jawline": 0.24,
    "midface": 0.16,
    "skin": 0.14,
    "harmony": 0.04,
}

# How far a metric can realistically move, in percentile points, with sustained
# routine adherence — and the ceiling it cannot cross.
#
# These caps exist to stop the product overpromising. A user at the 20th
# percentile for acne can reach a good place; they cannot reach the 99th. The
# gap between "today" and "reachable" is the core promise of the app, so
# inflating it is the fastest way to lose trust after eight weeks of effort.
REACHABLE_GAIN: dict[str, tuple[float, float]] = {
    # mutability: (max gain in percentile points, absolute ceiling)
    "fixed": (0.0, 0.0),
    "slow": (18.0, 85.0),
    "responsive": (30.0, 92.0),
}


def band_for(score: float) -> ScoreBand:
    if score < 40:
        return ScoreBand.LOW
    if score < 65:
        return ScoreBand.MID
    if score < 85:
        return ScoreBand.HIGH
    return ScoreBand.ELITE


def reachable_percentile(metric_key: str, percentile: float) -> float:
    """Where this metric can realistically land with sustained effort.

    Bone geometry does not move without surgery, so `fixed` metrics return their
    current value unchanged. Telling a user their gonial angle will improve
    would be a lie, and the honesty of this projection is the product.
    """
    mutability = METRIC_META[metric_key]["mutability"]
    max_gain, ceiling = REACHABLE_GAIN[mutability]
    if max_gain == 0:
        return percentile
    return min(percentile + max_gain, ceiling, 100.0) if percentile < ceiling else percentile


def to_percentile(metric_key: str, raw: float, age: int, sex: str) -> tuple[float, float]:
    """TODO(faz-2): look up the reference distribution and return (percentile, z).

    Reference distributions live in the ``metric_norms`` table so they can be
    re-fitted without a deploy. `direction` decides whether a high raw value is
    good ('higher'), bad ('lower'), or whether distance from the mean in either
    direction is what counts ('optimal').
    """
    raise NotImplementedError("normalisation lands in Faz 2")


def build_sub_scores(metrics: list[MetricResult]) -> list[SubScore]:
    """Aggregate per-metric percentiles into the groups the score screen shows.

    A group whose metrics are all missing (a front-only scan has no side
    metrics) is reported with ``complete=False`` rather than silently scored
    from a partial set — a jawline score computed without the side capture
    would move when the user later adds one, and look like a regression.
    """
    by_key = {metric.key: metric for metric in metrics}
    sub_scores: list[SubScore] = []

    for group, keys in METRIC_GROUPS.items():
        present = [by_key[key] for key in keys if key in by_key]
        if not present:
            continue

        score = sum(metric.percentile for metric in present) / len(present)
        reachable = sum(metric.reachablePercentile for metric in present) / len(present)
        sub_scores.append(
            SubScore(
                group=group,
                score=round(score, 1),
                reachable=round(reachable, 1),
                band=band_for(score),
                complete=len(present) == len(keys),
            )
        )

    return sub_scores


def combine(sub_scores: list[SubScore]) -> tuple[float, float]:
    """Weighted overall score and its reachable projection.

    Weights are renormalised over the groups actually present, so a front-only
    scan is not penalised for lacking side metrics — it just has a wider
    confidence interval, which the UI communicates separately.
    """
    if not sub_scores:
        raise ValueError("cannot combine an empty sub-score list")

    total_weight = sum(GROUP_WEIGHTS[sub.group] for sub in sub_scores)
    overall = sum(GROUP_WEIGHTS[sub.group] * sub.score for sub in sub_scores) / total_weight
    reachable = sum(GROUP_WEIGHTS[sub.group] * sub.reachable for sub in sub_scores) / total_weight

    # Floating-point aggregation can put reachable a hair below overall when
    # every metric is fixed. The projection must never read as a regression.
    return round(overall, 1), round(max(reachable, overall), 1)

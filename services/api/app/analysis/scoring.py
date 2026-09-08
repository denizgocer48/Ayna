"""Normalisation and scoring.

A raw measurement means nothing on its own: a 128-degree gonial angle sits in a
different percentile for a 19-year-old man and a 45-year-old woman. Every metric
is converted to a percentile against a reference distribution selected by age
band and sex, then combined with fixed weights.

Deliberately NOT an LLM. An LLM asked to "rate this face" is not reproducible,
and a score that moves between two photos of the same face in the same session
destroys the product's credibility.
"""

from app.schemas import METRIC_GROUPS, ScoreBand

# Group weights for the overall score. Tuned in Faz 2 against a labelled set;
# these placeholders are deliberately uniform so nobody mistakes them for
# validated values.
GROUP_WEIGHTS: dict[str, float] = {group: 1 / len(METRIC_GROUPS) for group in METRIC_GROUPS}


def band_for(score: float) -> ScoreBand:
    if score < 40:
        return ScoreBand.LOW
    if score < 65:
        return ScoreBand.MID
    if score < 85:
        return ScoreBand.HIGH
    return ScoreBand.ELITE


def to_percentile(metric_key: str, raw: float, age: int, sex: str) -> tuple[float, float]:
    """TODO(faz-2): look up the reference distribution and return (percentile, z).

    Reference distributions live in the ``metric_norms`` table so they can be
    updated without a deploy.
    """
    raise NotImplementedError("normalisation lands in Faz 2")

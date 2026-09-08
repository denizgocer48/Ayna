"""Progress against the user's own baseline.

This replaces the percentile scoring the product originally planned. The reason
is recorded in `docs/norms.md`: roughly a third of the metrics have no published
reference distribution, and nothing validates our landmark source against the
anthropometric literature, so "you are at the 62nd percentile" cannot be
grounded. Comparing a user to their own earlier scan needs no reference
population at all — and it is the comparison that actually matters to them.

Two rules keep this honest, and both are enforced here rather than left to the
UI:

  1. A `fixed` metric can never show progress. Bone geometry does not move, so
     any difference between two scans is measurement noise. Reporting it as
     improvement would be a lie the user cannot check.
  2. A movement smaller than the metric's noise floor is `held`, not progress.
     Dressing up noise as a win is the same dishonesty as an unreliable score.
"""

from app.schemas import (
    METRIC_GROUPS,
    METRIC_META,
    NOISE_FLOOR,
    GroupProgress,
    Measurement,
    MetricChange,
    Trend,
)


def relative_change(current: float, baseline: float) -> float:
    """Signed fractional change. Raises on a zero baseline rather than guessing."""
    if baseline == 0.0:
        raise ValueError("cannot express change relative to a zero baseline")
    return (current - baseline) / abs(baseline)


def is_significant(metric_key: str, change: float) -> bool:
    """Whether a movement clears this metric's noise floor."""
    mutability = METRIC_META[metric_key]["mutability"]
    return abs(change) >= NOISE_FLOOR[mutability]


def classify(metric_key: str, change: float) -> Trend:
    """Turn a signed change into a trend, honouring the metric's better direction."""
    meta = METRIC_META[metric_key]

    # Bone geometry cannot improve, and a metric with no better direction cannot
    # be scored as progress in either direction.
    if meta["mutability"] == "fixed" or meta["direction"] == "neutral":
        return Trend.NOT_COMPARABLE

    if not is_significant(metric_key, change):
        return Trend.HELD

    improved = change > 0 if meta["direction"] == "higher_better" else change < 0
    return Trend.IMPROVED if improved else Trend.DECLINED


def compare(current: list[Measurement], baseline: list[Measurement]) -> list[MetricChange]:
    """Per-metric change between two scans, for every metric present in both."""
    baseline_by_key = {measurement.key: measurement for measurement in baseline}

    changes: list[MetricChange] = []
    for measurement in current:
        earlier = baseline_by_key.get(measurement.key)
        if earlier is None:
            continue

        change = relative_change(measurement.value, earlier.value)
        changes.append(
            MetricChange(
                key=measurement.key,
                unit=measurement.unit,
                current=measurement.value,
                baseline=earlier.value,
                relativeChange=round(change, 4),
                trend=classify(measurement.key, change),
                significant=is_significant(measurement.key, change),
            )
        )

    return changes


def summarise_by_group(changes: list[MetricChange]) -> list[GroupProgress]:
    """Count what moved, per group.

    Deliberately a count rather than a group score. A single number over a group
    would need weights, and weighting measurements in different units needs the
    reference distribution we do not have. Counting needs nothing and cannot
    mislead.
    """
    by_key = {change.key: change for change in changes}

    summaries: list[GroupProgress] = []
    for group, keys in METRIC_GROUPS.items():
        present = [by_key[key] for key in keys if key in by_key]
        if not present:
            continue

        summaries.append(
            GroupProgress(
                group=group,
                improved=sum(1 for c in present if c.trend == Trend.IMPROVED),
                held=sum(1 for c in present if c.trend == Trend.HELD),
                declined=sum(1 for c in present if c.trend == Trend.DECLINED),
                complete=len(present) == len(keys),
            )
        )

    return summaries

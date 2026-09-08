"""The reachable projection is the product's central claim — it gets tests."""

import pytest

from app.analysis.scoring import (
    GROUP_WEIGHTS,
    build_sub_scores,
    combine,
    reachable_percentile,
)
from app.schemas import METRIC_GROUPS, METRIC_META, MetricResult


def metric(key: str, percentile: float) -> MetricResult:
    return MetricResult(
        key=key,
        raw=0.0,
        unit=METRIC_META[key]["unit"],
        percentile=percentile,
        zScore=0.0,
        reachablePercentile=reachable_percentile(key, percentile),
    )


def test_fixed_metrics_cannot_improve() -> None:
    # Bone geometry does not move without surgery.
    assert reachable_percentile("gonial_angle", 40.0) == 40.0
    assert reachable_percentile("fwhr", 12.0) == 12.0


def test_responsive_metrics_gain_but_are_capped() -> None:
    assert reachable_percentile("acne_density", 30.0) == 60.0
    # The ceiling stops the projection overpromising at the top end.
    assert reachable_percentile("acne_density", 80.0) == 92.0


def test_reachable_never_drops_below_current() -> None:
    # A metric already above its ceiling keeps its value rather than regressing.
    assert reachable_percentile("acne_density", 96.0) == 96.0
    assert reachable_percentile("jawline_definition", 90.0) == 90.0


def test_group_weights_cover_every_group() -> None:
    assert set(GROUP_WEIGHTS) == set(METRIC_GROUPS)
    assert GROUP_WEIGHTS.keys() == METRIC_GROUPS.keys()
    assert pytest.approx(sum(GROUP_WEIGHTS.values()), abs=1e-9) == 1.0


def test_front_only_scan_marks_incomplete_groups() -> None:
    front_keys = [key for key, meta in METRIC_META.items() if meta["pose"] == "front"]
    subs = build_sub_scores([metric(key, 50.0) for key in front_keys])

    by_group = {sub.group: sub for sub in subs}
    # Jawline needs side metrics to be complete; eyes does not.
    assert by_group["jawline"].complete is False
    assert by_group["eyes"].complete is True


def test_combine_never_projects_below_today() -> None:
    fixed_only = [key for key, meta in METRIC_META.items() if meta["mutability"] == "fixed"]
    subs = build_sub_scores([metric(key, 55.0) for key in fixed_only])
    overall, reachable = combine(subs)

    assert reachable >= overall


def test_combine_rejects_empty_input() -> None:
    with pytest.raises(ValueError):
        combine([])

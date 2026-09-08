"""Progress is now the product's central claim, so it is tested directly.

The tests that matter here are the refusals: what the engine declines to call
progress. Reporting noise or immutable geometry as improvement would be the same
dishonesty as an unreliable score, and it is the failure mode the whole design
exists to avoid.
"""

import pytest

from app.analysis.progress import (
    classify,
    compare,
    is_significant,
    relative_change,
    summarise_by_group,
)
from app.schemas import METRIC_META, Measurement, Trend


def m(key: str, value: float) -> Measurement:
    return Measurement(key=key, value=value, unit=METRIC_META[key]["unit"])


def test_relative_change_is_signed_and_fractional() -> None:
    assert relative_change(1.08, 1.00) == pytest.approx(0.08)
    assert relative_change(0.92, 1.00) == pytest.approx(-0.08)


def test_relative_change_rejects_a_zero_baseline() -> None:
    with pytest.raises(ValueError):
        relative_change(1.0, 0.0)


def test_relative_change_handles_a_negative_baseline() -> None:
    # Canthal tilt can be negative. A rise from -2 to -1 is an improvement of
    # half the magnitude, not minus half.
    assert relative_change(-1.0, -2.0) == pytest.approx(0.5)


def test_bone_geometry_can_never_show_progress() -> None:
    # fwhr is fixed. Even a large apparent change is noise, not improvement.
    assert classify("fwhr", 0.40) is Trend.NOT_COMPARABLE
    assert classify("gonial_angle", -0.40) is Trend.NOT_COMPARABLE
    assert not is_significant("fwhr", 0.40)


def test_a_metric_with_no_better_direction_is_not_scored() -> None:
    # Nose width has no defensible "better". Measured and shown, never ranked.
    assert classify("nose_width_ratio", 0.30) is Trend.NOT_COMPARABLE


def test_movement_inside_the_noise_floor_is_held() -> None:
    assert classify("jawline_definition", 0.02) is Trend.HELD
    assert classify("jawline_definition", -0.02) is Trend.HELD


def test_higher_better_metrics_read_the_right_way() -> None:
    assert classify("jawline_definition", 0.09) is Trend.IMPROVED
    assert classify("jawline_definition", -0.09) is Trend.DECLINED


def test_lower_better_metrics_read_the_right_way() -> None:
    # A smaller submental-cervical angle is the improvement.
    assert classify("submental_cervical_angle", -0.09) is Trend.IMPROVED
    assert classify("submental_cervical_angle", 0.09) is Trend.DECLINED


def test_compare_only_reports_metrics_present_in_both_scans() -> None:
    baseline = [m("jawline_definition", 0.60), m("symmetry_index", 0.90)]
    current = [m("jawline_definition", 0.66), m("gonial_angle", 120.0)]

    changes = compare(current, baseline)
    assert [change.key for change in changes] == ["jawline_definition"]


def test_compare_reports_the_change_and_its_significance() -> None:
    changes = compare([m("jawline_definition", 0.66)], [m("jawline_definition", 0.60)])
    change = changes[0]

    assert change.relativeChange == pytest.approx(0.1)
    assert change.trend is Trend.IMPROVED
    assert change.significant is True


def test_group_summary_counts_rather_than_scores() -> None:
    baseline = [m("jawline_definition", 0.60), m("gonial_angle", 120.0)]
    current = [m("jawline_definition", 0.70), m("gonial_angle", 128.0)]

    summary = {group.group: group for group in summarise_by_group(compare(current, baseline))}

    jawline = summary["jawline"]
    assert jawline.improved == 1  # jawline_definition moved and can move
    assert jawline.declined == 0  # gonial_angle is fixed, so it counts as neither
    assert jawline.held == 0
    assert jawline.complete is False  # no side capture in this scan


def test_an_unchanged_face_shows_no_improvement_anywhere() -> None:
    measurements = [m(key, 1.0) for key in METRIC_META]
    changes = compare(measurements, measurements)

    assert all(change.trend is not Trend.IMPROVED for change in changes)
    assert all(not change.significant for change in changes)

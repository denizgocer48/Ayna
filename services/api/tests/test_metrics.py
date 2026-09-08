"""Metric tests.

The important ones here are the invariance tests. Reproducibility is the
product's only defensible claim, so "the same face measured at a different
distance gives the same numbers" is not a nice property — it is the thing being
sold, and it gets asserted directly.
"""

import math

import numpy as np
import pytest

from app.analysis.metrics import (
    FRONT_METRICS,
    PROFILE_METRICS,
    FrontPoints,
    ProfilePoints,
    canthal_tilt,
    compute_all,
    symmetry_index,
)
from app.schemas import METRIC_META


def p(x: float, y: float) -> np.ndarray:
    return np.array([x, y], dtype=np.float64)


def symmetric_face(canthal_rise: float = 4.0) -> FrontPoints:
    """A schematic, perfectly symmetric face. Midline at x = 0, y grows downward."""
    return FrontPoints(
        trichion=p(0, -100),
        glabella=p(0, -40),
        nasion=p(0, -30),
        subnasale=p(0, 20),
        menton=p(0, 80),
        left_lateral_canthus=p(40, -30 - canthal_rise),
        right_lateral_canthus=p(-40, -30 - canthal_rise),
        left_medial_canthus=p(15, -30),
        right_medial_canthus=p(-15, -30),
        left_pupil=p(27, -30),
        right_pupil=p(-27, -30),
        left_eye_top=p(27, -38),
        right_eye_top=p(-27, -38),
        left_eye_bottom=p(27, -22),
        right_eye_bottom=p(-27, -22),
        left_zygion=p(65, -20),
        right_zygion=p(-65, -20),
        left_gonion=p(55, 40),
        right_gonion=p(-55, 40),
        left_jaw_mid=p(40, 62),
        right_jaw_mid=p(-40, 62),
        left_alare=p(12, 15),
        right_alare=p(-12, 15),
        left_cheilion=p(22, 40),
        right_cheilion=p(-22, 40),
        labiale_superius=p(0, 33),
        labiale_inferius=p(0, 47),
        stomion=p(0, 40),
    )


def profile_face() -> ProfilePoints:
    return ProfilePoints(
        glabella=p(10, -40),
        nasion=p(8, -30),
        rhinion=p(18, -10),
        pronasale=p(32, 8),
        subnasale=p(14, 20),
        pogonion=p(16, 70),
        menton=p(10, 80),
        gonion=p(-45, 45),
        condylion=p(-52, -20),
        cervical_point=p(-20, 95),
    )


def transform(face: FrontPoints, scale: float = 1.0, shift: tuple[float, float] = (0.0, 0.0)):
    offset = np.array(shift, dtype=np.float64)
    return FrontPoints(
        **{name: value * scale + offset for name, value in face.__dict__.items()}
    )


def test_metric_functions_cover_the_catalogue_exactly() -> None:
    implemented = set(FRONT_METRICS) | set(PROFILE_METRICS)
    catalogued = {
        key for key, meta in METRIC_META.items() if meta["provenance"] == "geometry"
    }
    assert implemented == catalogued


def test_a_symmetric_face_scores_perfect_symmetry() -> None:
    assert symmetry_index(symmetric_face()) == pytest.approx(1.0)


def test_asymmetry_lowers_the_symmetry_index() -> None:
    face = symmetric_face()
    shifted = FrontPoints(**{**face.__dict__, "left_gonion": p(70, 40)})
    assert symmetry_index(shifted) < symmetry_index(face)


def test_canthal_tilt_reads_positive_when_outer_corners_sit_higher() -> None:
    # Outer corners raised by 4 units over a 25-unit horizontal span.
    expected = math.degrees(math.atan2(4.0, 25.0))
    assert canthal_tilt(symmetric_face(canthal_rise=4.0)) == pytest.approx(expected)


def test_canthal_tilt_is_zero_for_a_level_eye_axis() -> None:
    assert canthal_tilt(symmetric_face(canthal_rise=0.0)) == pytest.approx(0.0)


def test_measurements_do_not_change_with_distance_from_the_camera() -> None:
    # The whole reproducibility claim in one assertion: a face photographed
    # twice as close must produce identical numbers.
    near = compute_all(symmetric_face())
    far = compute_all(transform(symmetric_face(), scale=2.5))
    for key, value in near.items():
        assert far[key] == pytest.approx(value), key


def test_measurements_do_not_change_with_position_in_frame() -> None:
    centred = compute_all(symmetric_face())
    offset = compute_all(transform(symmetric_face(), shift=(320.0, -75.0)))
    for key, value in centred.items():
        assert offset[key] == pytest.approx(value), key


@pytest.mark.parametrize("degrees", [5.0, 10.0, 20.0, -15.0])
def test_measurements_do_not_change_when_the_image_is_rotated(degrees: float) -> None:
    """Every metric is invariant to in-plane rotation.

    This falls out of the construction rather than being designed in: each metric
    is a ratio of distances, an angle between two rays, or a tilt averaged across
    the left eye and the mirrored right eye. All three are rotation-invariant,
    and the averaging in `canthal_tilt` cancels the rotation exactly.

    The capture gate still caps roll, and this result does not make it redundant.
    A real head turning relative to the camera is not a pure in-plane rotation of
    a flat picture: perspective changes, features occlude, and the landmark
    detector's own accuracy degrades. What this test rules out is the arithmetic
    contributing error of its own on top of that.
    """
    face = symmetric_face()
    theta = math.radians(degrees)
    rotation = np.array(
        [[math.cos(theta), -math.sin(theta)], [math.sin(theta), math.cos(theta)]]
    )
    rotated = FrontPoints(**{name: rotation @ value for name, value in face.__dict__.items()})

    upright = compute_all(face)
    turned = compute_all(rotated)
    for key, value in upright.items():
        assert turned[key] == pytest.approx(value), key


def test_front_only_scan_omits_profile_metrics() -> None:
    values = compute_all(symmetric_face())
    assert set(values) == set(FRONT_METRICS)
    assert not set(values) & set(PROFILE_METRICS)


def test_profile_capture_adds_exactly_the_profile_metrics() -> None:
    values = compute_all(symmetric_face(), profile_face())
    assert set(values) == set(FRONT_METRICS) | set(PROFILE_METRICS)


def test_every_metric_returns_a_finite_number() -> None:
    for key, value in compute_all(symmetric_face(), profile_face()).items():
        assert math.isfinite(value), key


def test_bounded_indices_stay_within_their_range() -> None:
    values = compute_all(symmetric_face(), profile_face())
    for key in (
        "facial_thirds_balance",
        "facial_fifths_balance",
        "jawline_definition",
        "symmetry_index",
        "nasal_dorsum_index",
    ):
        assert 0.0 < values[key] <= 1.0, key

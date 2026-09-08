"""Geometry is the foundation of a reproducible score, so it gets exact tests.

Every case below has an analytically known answer — no fixtures recorded from a
previous run, which would only prove the code still does what it used to.
"""

import math

import numpy as np
import pytest

from app.analysis.geometry import (
    angle_at,
    balance_index,
    distance,
    midpoint,
    ratio,
    reflect_across,
    tilt,
)


def p(x: float, y: float) -> np.ndarray:
    return np.array([x, y], dtype=np.float64)


def test_distance_is_euclidean_and_ignores_z() -> None:
    assert distance(p(0, 0), p(3, 4)) == 5.0
    # A landmark's z is a weak depth guess and must not affect a measurement.
    assert distance(np.array([0.0, 0.0, 99.0]), np.array([3.0, 4.0, -99.0])) == 5.0


def test_angle_at_right_angle() -> None:
    assert angle_at(p(0, 0), p(1, 0), p(0, 1)) == pytest.approx(90.0)


def test_angle_at_straight_line() -> None:
    assert angle_at(p(0, 0), p(1, 0), p(-1, 0)) == pytest.approx(180.0)


def test_angle_at_equilateral() -> None:
    apex = p(0.5, math.sqrt(3) / 2)
    assert angle_at(p(0, 0), p(1, 0), apex) == pytest.approx(60.0)


def test_angle_at_rejects_degenerate_ray() -> None:
    with pytest.raises(ValueError):
        angle_at(p(0, 0), p(0, 0), p(1, 1))


def test_tilt_sign_follows_the_face_not_the_image() -> None:
    # Image y grows downward. A point that is higher on the face has smaller y,
    # and must read as a positive tilt.
    assert tilt(p(0, 0), p(1, -1)) == pytest.approx(45.0)
    assert tilt(p(0, 0), p(1, 1)) == pytest.approx(-45.0)
    assert tilt(p(0, 0), p(1, 0)) == pytest.approx(0.0)


def test_tilt_rejects_identical_points() -> None:
    with pytest.raises(ValueError):
        tilt(p(1, 1), p(1, 1))


def test_midpoint() -> None:
    assert np.allclose(midpoint(p(0, 0), p(4, 2)), p(2, 1))


def test_ratio_rejects_zero_denominator() -> None:
    with pytest.raises(ValueError):
        ratio(1.0, 0.0)


def test_balance_index_is_one_for_equal_values() -> None:
    assert balance_index([10.0, 10.0, 10.0]) == pytest.approx(1.0)


def test_balance_index_decreases_with_dispersion() -> None:
    even = balance_index([10.0, 10.0, 10.0])
    slight = balance_index([9.0, 10.0, 11.0])
    severe = balance_index([2.0, 10.0, 18.0])
    assert even > slight > severe
    assert 0.0 < severe < 1.0


def test_balance_index_is_scale_invariant() -> None:
    # Doubling every segment describes the same face, larger. The index must not move.
    assert balance_index([9.0, 10.0, 11.0]) == pytest.approx(balance_index([18.0, 20.0, 22.0]))


def test_balance_index_rejects_bad_input() -> None:
    with pytest.raises(ValueError):
        balance_index([10.0])
    with pytest.raises(ValueError):
        balance_index([10.0, 0.0])


def test_reflect_across_vertical_axis() -> None:
    reflected = reflect_across(p(3, 5), p(0, 0), p(0, 10))
    assert np.allclose(reflected, p(-3, 5))


def test_reflect_across_is_an_involution() -> None:
    axis_a, axis_b = p(1, 0), p(2, 3)
    original = p(7, -4)
    once = reflect_across(original, axis_a, axis_b)
    assert np.allclose(reflect_across(once, axis_a, axis_b), original)


def test_point_on_axis_reflects_to_itself() -> None:
    assert np.allclose(reflect_across(p(0, 5), p(0, 0), p(0, 10)), p(0, 5))

"""Pure 2D geometry over landmark points.

Everything here is a total function of its arguments: same points in, same
number out. That property is the product's central claim, so this module holds
no state, no configuration and no randomness, and it never imports anything
from the rest of the application.

Points are numpy arrays. Only the first two components are used — landmark z is
a weak monocular depth estimate and is deliberately ignored, because letting it
into a measurement would make the result depend on the detector's depth guess
rather than on the image.
"""

import math

import numpy as np
from numpy.typing import NDArray

Point = NDArray[np.float64]


def _xy(point: Point) -> NDArray[np.float64]:
    return np.asarray(point, dtype=np.float64)[:2]


def distance(a: Point, b: Point) -> float:
    """Euclidean distance in the image plane."""
    return float(np.linalg.norm(_xy(a) - _xy(b)))


def midpoint(a: Point, b: Point) -> Point:
    return (_xy(a) + _xy(b)) / 2.0


def angle_at(vertex: Point, a: Point, b: Point) -> float:
    """Interior angle at ``vertex`` between the rays to ``a`` and ``b``, degrees.

    Returns a value in [0, 180]. Raises when a ray has zero length, because a
    zero-length ray means the landmark set is degenerate and silently returning
    an angle would hide that.
    """
    u = _xy(a) - _xy(vertex)
    v = _xy(b) - _xy(vertex)

    norms = float(np.linalg.norm(u) * np.linalg.norm(v))
    if norms == 0.0:
        raise ValueError("angle_at received a zero-length ray")

    cosine = float(np.dot(u, v)) / norms
    return math.degrees(math.acos(max(-1.0, min(1.0, cosine))))


def tilt(a: Point, b: Point) -> float:
    """Signed angle of the segment a->b against horizontal, degrees.

    Image coordinates put y downward, so this negates y to give the intuitive
    sign: positive means b sits higher than a on the face.
    """
    delta = _xy(b) - _xy(a)
    if delta[0] == 0.0 and delta[1] == 0.0:
        raise ValueError("tilt received two identical points")
    return math.degrees(math.atan2(-float(delta[1]), float(delta[0])))


def ratio(numerator: float, denominator: float) -> float:
    """Guarded division. A zero denominator means a degenerate landmark set."""
    if denominator == 0.0:
        raise ValueError("ratio received a zero denominator")
    return numerator / denominator


def balance_index(values: list[float]) -> float:
    """How equal a set of measurements is, on (0, 1]. Exactly 1.0 when equal.

    Used for the facial thirds and fifths, where the meaningful quantity is not
    any single segment but how evenly the segments divide the face. Implemented
    as 1 / (1 + coefficient of variation) so it is smooth, bounded, and needs no
    clamping — the alternative, 1 - cv, goes negative for very uneven inputs and
    then has to be clipped, which flattens real differences at the bottom end.
    """
    if len(values) < 2:
        raise ValueError("balance_index needs at least two values")
    if any(value <= 0.0 for value in values):
        raise ValueError("balance_index needs positive values")

    array = np.asarray(values, dtype=np.float64)
    coefficient_of_variation = float(array.std() / array.mean())
    return 1.0 / (1.0 + coefficient_of_variation)


def reflect_across(point: Point, axis_a: Point, axis_b: Point) -> Point:
    """Mirror ``point`` across the line through ``axis_a`` and ``axis_b``."""
    p = _xy(point)
    a = _xy(axis_a)
    direction = _xy(axis_b) - a

    length_squared = float(np.dot(direction, direction))
    if length_squared == 0.0:
        raise ValueError("reflect_across received a zero-length axis")

    relative = p - a
    projection = (float(np.dot(relative, direction)) / length_squared) * direction
    return a + 2.0 * projection - relative

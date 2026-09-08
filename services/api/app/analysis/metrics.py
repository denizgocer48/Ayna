"""Deterministic facial measurements.

Every function here is pure: the same points in produce the same number out. No
randomness, no model inference, no LLM. This is what makes a score reproducible
across two photos in the same session — the property the incumbents fail on and
the only defensible claim the product has.

Units: angles in degrees, everything else a unitless ratio or a bounded index.
Ratios are normalised against a facial width or height rather than pixels, so a
measurement does not change when the user holds the phone closer.

Landmarks arrive here already resolved into named anatomical points. That
separation is deliberate: the arithmetic below is correct regardless of which
detector produced the points, and the index mapping that is specific to
MediaPipe lives in `landmark_map.py` where it can be verified on its own.
"""

from dataclasses import dataclass

from app.analysis.geometry import (
    Point,
    angle_at,
    balance_index,
    distance,
    midpoint,
    ratio,
    reflect_across,
    tilt,
)

# --- point sets --------------------------------------------------------------


@dataclass(frozen=True)
class FrontPoints:
    """Named anatomical points from a front-facing capture."""

    trichion: Point  # hairline, facial midline
    glabella: Point  # smooth prominence between the brows
    nasion: Point  # bridge of the nose, at eye level
    subnasale: Point  # where the nasal septum meets the upper lip
    menton: Point  # lowest point of the chin

    left_lateral_canthus: Point  # outer eye corner
    right_lateral_canthus: Point
    left_medial_canthus: Point  # inner eye corner
    right_medial_canthus: Point
    left_pupil: Point
    right_pupil: Point
    left_eye_top: Point
    right_eye_top: Point
    left_eye_bottom: Point
    right_eye_bottom: Point

    left_zygion: Point  # widest point of the cheekbone
    right_zygion: Point
    left_gonion: Point  # angle of the jaw
    right_gonion: Point
    left_jaw_mid: Point  # midway along the jaw contour, gonion to menton
    right_jaw_mid: Point

    left_alare: Point  # outer edge of the nostril wing
    right_alare: Point
    left_cheilion: Point  # mouth corner
    right_cheilion: Point
    labiale_superius: Point  # upper lip, vermilion border
    labiale_inferius: Point  # lower lip, vermilion border
    stomion: Point  # where the lips meet


@dataclass(frozen=True)
class ProfilePoints:
    """Named anatomical points from a side capture."""

    glabella: Point
    nasion: Point
    rhinion: Point  # midpoint of the nasal dorsum
    pronasale: Point  # tip of the nose
    subnasale: Point
    pogonion: Point  # most forward point of the chin
    menton: Point
    gonion: Point
    condylion: Point  # top of the mandibular ramus, near the ear
    cervical_point: Point  # innermost point where the neck meets the chin


# --- front measurements ------------------------------------------------------


def bizygomatic_width(f: FrontPoints) -> float:
    """The reference width most ratios are normalised against."""
    return distance(f.left_zygion, f.right_zygion)


def canthal_tilt(f: FrontPoints) -> float:
    """Mean upward tilt of the eye axis, degrees. Positive means the outer corner sits higher."""
    left = tilt(f.left_medial_canthus, f.left_lateral_canthus)
    # The right eye runs the other way in x, so measuring medial->lateral there
    # yields an angle near 180 degrees rather than the mirror of the left eye.
    # Traverse it lateral->medial instead — that vector points the same way in x
    # as the left eye's — then negate, because rising anatomy now means falling y
    # along the direction of travel.
    right = -tilt(f.right_lateral_canthus, f.right_medial_canthus)
    return (left + right) / 2.0


def interpupillary_ratio(f: FrontPoints) -> float:
    return ratio(distance(f.left_pupil, f.right_pupil), bizygomatic_width(f))


def eye_aspect_ratio(f: FrontPoints) -> float:
    """Mean eye openness: height over width, averaged across both eyes."""
    left = ratio(
        distance(f.left_eye_top, f.left_eye_bottom),
        distance(f.left_medial_canthus, f.left_lateral_canthus),
    )
    right = ratio(
        distance(f.right_eye_top, f.right_eye_bottom),
        distance(f.right_medial_canthus, f.right_lateral_canthus),
    )
    return (left + right) / 2.0


def eye_spacing_ratio(f: FrontPoints) -> float:
    """Intercanthal distance over mean eye width. Near 1.0 is the classical canon."""
    intercanthal = distance(f.left_medial_canthus, f.right_medial_canthus)
    mean_eye_width = (
        distance(f.left_medial_canthus, f.left_lateral_canthus)
        + distance(f.right_medial_canthus, f.right_lateral_canthus)
    ) / 2.0
    return ratio(intercanthal, mean_eye_width)


def facial_thirds_balance(f: FrontPoints) -> float:
    """How evenly the face divides into upper, middle and lower thirds."""
    return balance_index(
        [
            distance(f.trichion, f.glabella),
            distance(f.glabella, f.subnasale),
            distance(f.subnasale, f.menton),
        ]
    )


def facial_fifths_balance(f: FrontPoints) -> float:
    """How evenly the face divides into five vertical fifths at eye level."""
    return balance_index(
        [
            distance(f.right_zygion, f.right_lateral_canthus),
            distance(f.right_lateral_canthus, f.right_medial_canthus),
            distance(f.right_medial_canthus, f.left_medial_canthus),
            distance(f.left_medial_canthus, f.left_lateral_canthus),
            distance(f.left_lateral_canthus, f.left_zygion),
        ]
    )


def fwhr(f: FrontPoints) -> float:
    """Facial width-to-height ratio: bizygomatic width over upper-face height."""
    return ratio(bizygomatic_width(f), distance(f.glabella, f.labiale_superius))


def face_length_width_ratio(f: FrontPoints) -> float:
    return ratio(distance(f.trichion, f.menton), bizygomatic_width(f))


def gonial_angle(f: FrontPoints) -> float:
    """Front-view estimate of the jaw angle, degrees.

    This is an estimate. The jaw angle is a three-dimensional quantity and the
    front view compresses it, which is exactly why `gonial_angle_true` exists and
    why the jawline sub-score reports `complete: false` without a side capture.
    """
    left = angle_at(f.left_gonion, f.left_zygion, f.menton)
    right = angle_at(f.right_gonion, f.right_zygion, f.menton)
    return (left + right) / 2.0


def jawline_definition(f: FrontPoints) -> float:
    """How straight the jaw contour runs from the jaw angle to the chin.

    A defined jawline reads as a near-straight line from gonion to menton; a
    softer one bows outward. Measured as the mid-contour point's deviation from
    that line, normalised by the line's length, then inverted so higher is more
    defined.
    """

    def side(gonion: Point, jaw_mid: Point) -> float:
        chord = distance(gonion, f.menton)
        straight_midpoint = midpoint(gonion, f.menton)
        deviation = distance(jaw_mid, straight_midpoint)
        return 1.0 / (1.0 + ratio(deviation, chord))

    return (side(f.left_gonion, f.left_jaw_mid) + side(f.right_gonion, f.right_jaw_mid)) / 2.0


def chin_projection_ratio(f: FrontPoints) -> float:
    """Lower-third height relative to the middle third. A front-view proxy only."""
    return ratio(distance(f.subnasale, f.menton), distance(f.glabella, f.subnasale))


def mandible_width_ratio(f: FrontPoints) -> float:
    return ratio(distance(f.left_gonion, f.right_gonion), bizygomatic_width(f))


def nasofrontal_angle(f: FrontPoints) -> float:
    """Angle at the nasion between the forehead and the nose, degrees."""
    return angle_at(f.nasion, f.glabella, f.subnasale)


def nose_width_ratio(f: FrontPoints) -> float:
    return ratio(distance(f.left_alare, f.right_alare), bizygomatic_width(f))


def philtrum_length_ratio(f: FrontPoints) -> float:
    return ratio(distance(f.subnasale, f.labiale_superius), distance(f.subnasale, f.menton))


def lip_fullness_ratio(f: FrontPoints) -> float:
    """Combined vermilion height over mouth width."""
    return ratio(
        distance(f.labiale_superius, f.labiale_inferius),
        distance(f.left_cheilion, f.right_cheilion),
    )


def symmetry_index(f: FrontPoints) -> float:
    """How closely the two halves mirror each other, on (0, 1].

    Each right-side landmark is reflected across the facial midline and compared
    to its left-side counterpart. Residuals are normalised by interpupillary
    distance so the result does not depend on image scale.
    """
    axis_a = midpoint(f.left_pupil, f.right_pupil)
    axis_b = f.menton

    pairs = (
        (f.left_lateral_canthus, f.right_lateral_canthus),
        (f.left_medial_canthus, f.right_medial_canthus),
        (f.left_zygion, f.right_zygion),
        (f.left_gonion, f.right_gonion),
        (f.left_alare, f.right_alare),
        (f.left_cheilion, f.right_cheilion),
    )

    scale = distance(f.left_pupil, f.right_pupil)
    residuals = [
        distance(left, reflect_across(right, axis_a, axis_b)) for left, right in pairs
    ]
    mean_residual = sum(residuals) / len(residuals)
    return 1.0 / (1.0 + ratio(mean_residual, scale))


# --- profile measurements ----------------------------------------------------


def gonial_angle_true(p: ProfilePoints) -> float:
    """The jaw angle measured where it is actually visible, degrees."""
    return angle_at(p.gonion, p.condylion, p.menton)


def ramus_body_ratio(p: ProfilePoints) -> float:
    return ratio(distance(p.condylion, p.gonion), distance(p.gonion, p.menton))


def chin_projection_true(p: ProfilePoints) -> float:
    """How far the chin projects forward of the nasion, relative to face height."""
    horizontal = abs(float(p.pogonion[0]) - float(p.nasion[0]))
    return ratio(horizontal, distance(p.nasion, p.menton))


def nasofrontal_angle_true(p: ProfilePoints) -> float:
    return angle_at(p.nasion, p.glabella, p.pronasale)


def nasal_dorsum_index(p: ProfilePoints) -> float:
    """How straight the nasal bridge runs, on (0, 1]. Higher is straighter."""
    chord = distance(p.nasion, p.pronasale)
    deviation = distance(p.rhinion, midpoint(p.nasion, p.pronasale))
    return 1.0 / (1.0 + ratio(deviation, chord))


def submental_cervical_angle(p: ProfilePoints) -> float:
    """Angle under the chin where it meets the neck, degrees."""
    return angle_at(p.cervical_point, p.menton, p.gonion)


# --- assembly ----------------------------------------------------------------

FRONT_METRICS = {
    "canthal_tilt": canthal_tilt,
    "interpupillary_ratio": interpupillary_ratio,
    "eye_aspect_ratio": eye_aspect_ratio,
    "eye_spacing_ratio": eye_spacing_ratio,
    "facial_thirds_balance": facial_thirds_balance,
    "facial_fifths_balance": facial_fifths_balance,
    "fwhr": fwhr,
    "face_length_width_ratio": face_length_width_ratio,
    "gonial_angle": gonial_angle,
    "jawline_definition": jawline_definition,
    "chin_projection_ratio": chin_projection_ratio,
    "mandible_width_ratio": mandible_width_ratio,
    "nasofrontal_angle": nasofrontal_angle,
    "nose_width_ratio": nose_width_ratio,
    "philtrum_length_ratio": philtrum_length_ratio,
    "lip_fullness_ratio": lip_fullness_ratio,
    "symmetry_index": symmetry_index,
}

PROFILE_METRICS = {
    "gonial_angle_true": gonial_angle_true,
    "ramus_body_ratio": ramus_body_ratio,
    "chin_projection_true": chin_projection_true,
    "nasofrontal_angle_true": nasofrontal_angle_true,
    "nasal_dorsum_index": nasal_dorsum_index,
    "submental_cervical_angle": submental_cervical_angle,
}


def compute_all(front: FrontPoints, profile: ProfilePoints | None = None) -> dict[str, float]:
    """Every measurable metric for this capture.

    A front-only scan simply omits the profile keys rather than estimating them.
    The scoring layer reports the affected group as incomplete, which is honest
    and, unlike a guess, does not move when the user later adds a side photo.
    """
    values = {name: fn(front) for name, fn in FRONT_METRICS.items()}
    if profile is not None:
        values.update({name: fn(profile) for name, fn in PROFILE_METRICS.items()})
    return values

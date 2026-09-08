"""Deterministic geometric measurements over a LandmarkSet.

Every function here is pure: same landmarks in, same number out. No randomness,
no model inference, no LLM. This is what makes a score reproducible — the same
face under different lighting must not move the measurement, only the
capture-quality gate.

Units: angles in degrees, everything else a unitless ratio normalised against
interpupillary distance so the result is scale-invariant.
"""

from app.analysis.landmarks import LandmarkSet

Unit = str

# key -> unit. Kept next to the implementations so a new metric cannot be added
# without declaring what it measures.
METRIC_UNITS: dict[str, Unit] = {
    "canthal_tilt": "deg",
    "interpupillary_ratio": "ratio",
    "eye_aspect_ratio": "ratio",
    "eye_spacing_ratio": "ratio",
    "facial_thirds_balance": "index",
    "facial_fifths_balance": "index",
    "fwhr": "ratio",
    "face_length_width_ratio": "ratio",
    "gonial_angle": "deg",
    "jawline_definition": "index",
    "chin_projection_ratio": "ratio",
    "mandible_width_ratio": "ratio",
    "nasofrontal_angle": "deg",
    "nose_width_ratio": "ratio",
    "philtrum_length_ratio": "ratio",
    "lip_fullness_ratio": "ratio",
    "symmetry_index": "index",
}


def compute_all(landmarks: LandmarkSet) -> dict[str, float]:
    """TODO(faz-2): compute every key in METRIC_UNITS from ``landmarks``."""
    raise NotImplementedError("metric computation lands in Faz 2")

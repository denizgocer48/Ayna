"""Face landmark extraction.

Backed by MediaPipe Face Landmarker (478 points). This module returns raw
geometry only — no interpretation, no scoring. Keeping extraction pure means
the scoring layer can be re-tuned without re-processing images.
"""

from dataclasses import dataclass

import numpy as np


@dataclass(frozen=True)
class LandmarkSet:
    """478 normalised (x, y, z) points plus the detector's head pose estimate."""

    points: np.ndarray  # shape (478, 3)
    yaw: float
    pitch: float
    roll: float
    confidence: float

    def __post_init__(self) -> None:
        if self.points.shape != (478, 3):
            raise ValueError(f"expected (478, 3) landmarks, got {self.points.shape}")


class LandmarkExtractionError(RuntimeError):
    """Raised when no usable face is found in the frame."""


def extract(image: np.ndarray) -> LandmarkSet:
    """TODO(faz-2): run MediaPipe Face Landmarker over ``image``.

    Must raise ``LandmarkExtractionError`` rather than returning a low-quality
    result — a silently degraded landmark set produces a plausible-looking but
    wrong score, which is worse than an error the user can act on.
    """
    raise NotImplementedError("landmark extraction lands in Faz 2")

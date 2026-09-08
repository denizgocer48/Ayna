"""Skin analysis.

Separate from `metrics.py` on purpose: these findings come from a segmentation
model, not from landmark geometry. They are noisier, they depend on lighting far
more than distances do, and they must never be presented with the same
confidence as a measured angle.

Skin is also where nearly all of a user's reachable gain lives — bone geometry
is fixed, skin is not — so this module carries the product's actual value.
"""

from dataclasses import dataclass

import numpy as np

from app.schemas import SKIN_KEYS


@dataclass(frozen=True)
class SkinFindings:
    """Per-metric index in 0-1, plus the mask area each was derived from."""

    values: dict[str, float]
    """Fraction of the face region the model could actually assess."""
    coverage: float

    def __post_init__(self) -> None:
        missing = set(SKIN_KEYS) - set(self.values)
        if missing:
            raise ValueError(f"missing skin metrics: {sorted(missing)}")


class SkinAnalysisError(RuntimeError):
    """Raised when the image cannot support a skin assessment."""


# Below this, lighting or occlusion left too little assessable skin. Returning a
# confident-looking number from a quarter of a face is worse than returning none.
MIN_COVERAGE = 0.55


def analyse(image: np.ndarray, face_mask: np.ndarray) -> SkinFindings:
    """TODO(faz-2): run the segmentation model over the masked face region.

    V1 uses a hosted skin-analysis API to avoid training from scratch; the
    interface here is deliberately provider-agnostic so swapping to an in-house
    model later does not touch the scoring layer.
    """
    raise NotImplementedError("skin analysis lands in Faz 2")

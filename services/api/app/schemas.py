"""Pydantic mirrors of packages/shared/src/*.ts.

These two definitions must move together. tests/test_contract.py fails the
build when a metric key, its metadata or a group drifts.
"""

from datetime import datetime
from enum import StrEnum
from typing import Literal, TypedDict

from pydantic import BaseModel, Field

Unit = Literal["deg", "ratio", "index"]
Provenance = Literal["geometry", "segmentation"]
Mutability = Literal["fixed", "slow", "responsive"]
Pose = Literal["front", "side"]
Direction = Literal["higher_better", "lower_better", "neutral"]


class MetricMeta(TypedDict):
    unit: Unit
    provenance: Provenance
    mutability: Mutability
    pose: Literal["front", "side", "either"]
    direction: Direction


# Order matters: the contract test compares this against the TypeScript list
# position by position. Kept as a table so a new metric is one readable row.
_METRIC_ROWS: tuple[tuple[str, Unit, Provenance, Mutability, str, Direction], ...] = (
    # key                        unit     provenance      mutability    pose      direction
    ("canthal_tilt",             "deg",   "geometry",     "fixed",      "front", "neutral"),
    ("interpupillary_ratio",     "ratio", "geometry",     "fixed",      "front", "neutral"),
    ("eye_aspect_ratio",         "ratio", "geometry",     "slow",       "front", "higher_better"),
    ("eye_spacing_ratio",        "ratio", "geometry",     "fixed",      "front", "neutral"),
    ("facial_thirds_balance",    "index", "geometry",     "fixed",      "front", "higher_better"),
    ("facial_fifths_balance",    "index", "geometry",     "fixed",      "front", "higher_better"),
    ("fwhr",                     "ratio", "geometry",     "fixed",      "front", "neutral"),
    ("face_length_width_ratio",  "ratio", "geometry",     "fixed",      "front", "neutral"),
    ("gonial_angle",             "deg",   "geometry",     "fixed",      "front", "neutral"),
    ("jawline_definition",       "index", "geometry",     "slow",       "front", "higher_better"),
    ("chin_projection_ratio",    "ratio", "geometry",     "fixed",      "front", "neutral"),
    ("mandible_width_ratio",     "ratio", "geometry",     "fixed",      "front", "neutral"),
    ("nasofrontal_angle",        "deg",   "geometry",     "fixed",      "front", "neutral"),
    ("nose_width_ratio",         "ratio", "geometry",     "fixed",      "front", "neutral"),
    ("philtrum_length_ratio",    "ratio", "geometry",     "fixed",      "front", "neutral"),
    ("lip_fullness_ratio",       "ratio", "geometry",     "slow",       "front", "neutral"),
    ("symmetry_index",           "index", "geometry",     "fixed",      "front", "higher_better"),
    ("gonial_angle_true",        "deg",   "geometry",     "fixed",      "side", "neutral"),
    ("ramus_body_ratio",         "ratio", "geometry",     "fixed",      "side", "neutral"),
    ("chin_projection_true",     "ratio", "geometry",     "fixed",      "side", "neutral"),
    ("nasofrontal_angle_true",   "deg",   "geometry",     "fixed",      "side", "neutral"),
    ("nasal_dorsum_index",       "index", "geometry",     "fixed",      "side", "neutral"),
    ("submental_cervical_angle", "deg",   "geometry",     "slow",       "side", "lower_better"),
    ("acne_density",             "index", "segmentation", "responsive", "front", "lower_better"),
    ("redness_index",            "index", "segmentation", "responsive", "front", "lower_better"),
    ("dark_circle_index",        "index", "segmentation", "responsive", "front", "lower_better"),
    ("pore_visibility",          "index", "segmentation", "slow",       "front", "lower_better"),
    ("texture_uniformity",       "index", "segmentation", "slow",       "front", "higher_better"),
    ("oiliness_index",           "index", "segmentation", "responsive", "front", "lower_better"),
    ("hyperpigmentation_index",  "index", "segmentation", "slow",       "front", "lower_better"),
)

METRIC_META: dict[str, MetricMeta] = {
    key: MetricMeta(  # type: ignore[typeddict-item]
        unit=unit,
        provenance=provenance,
        mutability=mutability,
        pose=pose,
        direction=direction,
    )
    for key, unit, provenance, mutability, pose, direction in _METRIC_ROWS
}

# Provisional noise floors as a fraction of the baseline value. Below this a
# change is indistinguishable from capture-to-capture variation and must be
# reported as "held". These are conservative guesses, not measurements — the
# calibration study in docs/norms.md is what would ground them.
NOISE_FLOOR: dict[str, float] = {
    "fixed": float("inf"),
    "slow": 0.04,
    "responsive": 0.03,
}

METRIC_KEYS: tuple[str, ...] = tuple(METRIC_META)

METRIC_GROUPS: dict[str, tuple[str, ...]] = {
    "eyes": ("canthal_tilt", "interpupillary_ratio", "eye_aspect_ratio", "eye_spacing_ratio"),
    "proportions": (
        "facial_thirds_balance",
        "facial_fifths_balance",
        "fwhr",
        "face_length_width_ratio",
    ),
    "jawline": (
        "gonial_angle",
        "jawline_definition",
        "chin_projection_ratio",
        "mandible_width_ratio",
        "gonial_angle_true",
        "ramus_body_ratio",
        "chin_projection_true",
        "submental_cervical_angle",
    ),
    "midface": (
        "nasofrontal_angle",
        "nose_width_ratio",
        "philtrum_length_ratio",
        "lip_fullness_ratio",
        "nasofrontal_angle_true",
        "nasal_dorsum_index",
    ),
    "skin": (
        "acne_density",
        "redness_index",
        "dark_circle_index",
        "pore_visibility",
        "texture_uniformity",
        "oiliness_index",
        "hyperpigmentation_index",
    ),
    "harmony": ("symmetry_index",),
}

SIDE_POSE_KEYS = tuple(k for k, m in METRIC_META.items() if m["pose"] == "side")
SKIN_KEYS = tuple(k for k, m in METRIC_META.items() if m["provenance"] == "segmentation")
FIXED_KEYS = tuple(k for k, m in METRIC_META.items() if m["mutability"] == "fixed")


class ScanStatus(StrEnum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETE = "complete"
    FAILED = "failed"
    REJECTED_QUALITY = "rejected_quality"


class Trend(StrEnum):
    IMPROVED = "improved"
    HELD = "held"
    DECLINED = "declined"
    NOT_COMPARABLE = "not_comparable"


class CaptureQuality(BaseModel):
    ok: bool
    issues: list[str]
    yaw: float
    pitch: float
    roll: float
    faceRatio: float
    brightness: float
    sharpness: float
    confidence: float


class ScanImageInput(BaseModel):
    pose: Pose
    imagePath: str = Field(min_length=1)
    quality: CaptureQuality


class CreateScanRequest(BaseModel):
    images: list[ScanImageInput] = Field(min_length=1, max_length=2)


class CreateScanResponse(BaseModel):
    scanId: str
    status: ScanStatus


class ScanImage(BaseModel):
    pose: Pose
    quality: CaptureQuality
    imagePath: str | None


class Measurement(BaseModel):
    key: str
    value: float
    unit: Unit


class MetricChange(BaseModel):
    key: str
    unit: Unit
    current: float
    baseline: float
    relativeChange: float
    trend: Trend
    significant: bool


class GroupProgress(BaseModel):
    group: str
    improved: int
    held: int
    declined: int
    complete: bool


class Progress(BaseModel):
    baselineScanId: str
    baselineCapturedAt: datetime
    daysSinceBaseline: int
    changes: list[MetricChange]
    byGroup: list[GroupProgress]


class Recommendation(BaseModel):
    id: str
    drivenBy: list[str]
    title: str
    body: str
    category: str
    effort: Literal["daily", "weekly", "one_off"]
    horizonWeeks: int


class ScanResult(BaseModel):
    scanId: str
    status: ScanStatus
    capturedAt: datetime
    images: list[ScanImage]
    measurements: list[Measurement]
    progress: Progress | None
    recommendations: list[Recommendation]
    locked: bool
    engineVersion: str

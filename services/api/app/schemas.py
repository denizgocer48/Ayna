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


class MetricMeta(TypedDict):
    unit: Unit
    provenance: Provenance
    mutability: Mutability
    pose: Literal["front", "side", "either"]


# Order matters: the contract test compares this against the TypeScript list
# position by position. Kept as a table so a new metric is one readable row.
_METRIC_ROWS: tuple[tuple[str, Unit, Provenance, Mutability, str], ...] = (
    # key                        unit     provenance      mutability    pose
    ("canthal_tilt",             "deg",   "geometry",     "fixed",      "front"),
    ("interpupillary_ratio",     "ratio", "geometry",     "fixed",      "front"),
    ("eye_aspect_ratio",         "ratio", "geometry",     "slow",       "front"),
    ("eye_spacing_ratio",        "ratio", "geometry",     "fixed",      "front"),
    ("facial_thirds_balance",    "index", "geometry",     "fixed",      "front"),
    ("facial_fifths_balance",    "index", "geometry",     "fixed",      "front"),
    ("fwhr",                     "ratio", "geometry",     "fixed",      "front"),
    ("face_length_width_ratio",  "ratio", "geometry",     "fixed",      "front"),
    ("gonial_angle",             "deg",   "geometry",     "fixed",      "front"),
    ("jawline_definition",       "index", "geometry",     "slow",       "front"),
    ("chin_projection_ratio",    "ratio", "geometry",     "fixed",      "front"),
    ("mandible_width_ratio",     "ratio", "geometry",     "fixed",      "front"),
    ("nasofrontal_angle",        "deg",   "geometry",     "fixed",      "front"),
    ("nose_width_ratio",         "ratio", "geometry",     "fixed",      "front"),
    ("philtrum_length_ratio",    "ratio", "geometry",     "fixed",      "front"),
    ("lip_fullness_ratio",       "ratio", "geometry",     "slow",       "front"),
    ("symmetry_index",           "index", "geometry",     "fixed",      "front"),
    ("gonial_angle_true",        "deg",   "geometry",     "fixed",      "side"),
    ("ramus_body_ratio",         "ratio", "geometry",     "fixed",      "side"),
    ("chin_projection_true",     "ratio", "geometry",     "fixed",      "side"),
    ("nasofrontal_angle_true",   "deg",   "geometry",     "fixed",      "side"),
    ("nasal_dorsum_index",       "index", "geometry",     "fixed",      "side"),
    ("submental_cervical_angle", "deg",   "geometry",     "slow",       "side"),
    ("acne_density",             "index", "segmentation", "responsive", "front"),
    ("redness_index",            "index", "segmentation", "responsive", "front"),
    ("dark_circle_index",        "index", "segmentation", "responsive", "front"),
    ("pore_visibility",          "index", "segmentation", "slow",       "front"),
    ("texture_uniformity",       "index", "segmentation", "slow",       "front"),
    ("oiliness_index",           "index", "segmentation", "responsive", "front"),
    ("hyperpigmentation_index",  "index", "segmentation", "slow",       "front"),
)

METRIC_META: dict[str, MetricMeta] = {
    key: MetricMeta(unit=unit, provenance=provenance, mutability=mutability, pose=pose)  # type: ignore[typeddict-item]
    for key, unit, provenance, mutability, pose in _METRIC_ROWS
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


class ScoreBand(StrEnum):
    LOW = "low"
    MID = "mid"
    HIGH = "high"
    ELITE = "elite"


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


class MetricResult(BaseModel):
    key: str
    raw: float
    unit: Unit
    percentile: float
    zScore: float
    reachablePercentile: float


class SubScore(BaseModel):
    group: str
    score: float
    reachable: float
    band: ScoreBand
    complete: bool


class Recommendation(BaseModel):
    id: str
    drivenBy: list[str]
    title: str
    body: str
    category: str
    effort: Literal["daily", "weekly", "one_off"]
    horizonWeeks: int
    expectedImpact: float


class ScanResult(BaseModel):
    scanId: str
    status: ScanStatus
    capturedAt: datetime
    images: list[ScanImage]
    overall: float
    band: ScoreBand
    reachable: float
    subScores: list[SubScore]
    metrics: list[MetricResult]
    recommendations: list[Recommendation]
    locked: bool
    engineVersion: str

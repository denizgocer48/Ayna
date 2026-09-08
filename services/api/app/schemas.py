"""Pydantic mirrors of packages/shared/src/*.ts.

These two definitions must move together. The contract test in
tests/test_contract.py fails the build when a metric key drifts.
"""

from datetime import datetime
from enum import StrEnum
from typing import Literal

from pydantic import BaseModel, Field

METRIC_KEYS: tuple[str, ...] = (
    "canthal_tilt",
    "interpupillary_ratio",
    "eye_aspect_ratio",
    "eye_spacing_ratio",
    "facial_thirds_balance",
    "facial_fifths_balance",
    "fwhr",
    "face_length_width_ratio",
    "gonial_angle",
    "jawline_definition",
    "chin_projection_ratio",
    "mandible_width_ratio",
    "nasofrontal_angle",
    "nose_width_ratio",
    "philtrum_length_ratio",
    "lip_fullness_ratio",
    "symmetry_index",
)

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
    ),
    "midface": (
        "nasofrontal_angle",
        "nose_width_ratio",
        "philtrum_length_ratio",
        "lip_fullness_ratio",
    ),
    "harmony": ("symmetry_index",),
}


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


class CreateScanRequest(BaseModel):
    imagePath: str = Field(min_length=1)
    pose: Literal["front", "side"] = "front"
    quality: CaptureQuality


class CreateScanResponse(BaseModel):
    scanId: str
    status: ScanStatus


class MetricResult(BaseModel):
    key: str
    raw: float
    unit: Literal["deg", "ratio", "index"]
    percentile: float
    zScore: float


class SubScore(BaseModel):
    group: str
    score: float
    band: ScoreBand


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
    pose: Literal["front", "side"]
    quality: CaptureQuality
    overall: float
    band: ScoreBand
    subScores: list[SubScore]
    metrics: list[MetricResult]
    recommendations: list[Recommendation]
    engineVersion: str

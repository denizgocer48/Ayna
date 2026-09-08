"""Recommendation generation.

Input is the metric table, never the image. Two consequences:
  1. No face data leaves our infrastructure for the LLM call.
  2. Every recommendation is attributable to a measurement, so the UI can show
     *why* it was given.

Hard rules for generated copy — enforced in review, see docs/compliance.md:
  - No medical claims ("treats acne", "cures").
  - No advice that requires a clinician (fillers, surgery, prescription drugs).
  - Only levers the user can actually move: skincare, grooming, hair, sleep,
     posture, body composition.
"""

from app.schemas import MetricResult, Recommendation

FORBIDDEN_TOPICS = (
    "surgery",
    "filler",
    "botox",
    "prescription",
    "isotretinoin",
    "steroid",
)


def generate(metrics: list[MetricResult], goals: list[str], locale: str) -> list[Recommendation]:
    """TODO(faz-2): rule-based selection, then Claude for the personalised copy."""
    raise NotImplementedError("recommendations land in Faz 2")

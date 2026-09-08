"""Recommendation generation.

Input is the metric table, never the image. Two consequences:
  1. No face data leaves our infrastructure for the LLM call.
  2. Every recommendation is attributable to a measurement, so the UI can show
     *why* it was given.

Generated copy is checked against the blocklists below before it is stored. See
docs/compliance.md for why each list exists.
"""

import re

from app.schemas import MetricResult, Recommendation

# Advice that requires a clinician. Claiming to treat a condition would put the
# app in a regulated medical-device category.
MEDICAL_TERMS: tuple[str, ...] = (
    "surgery",
    "surgical",
    "filler",
    "fillers",
    "botox",
    "prescription",
    "isotretinoin",
    "accutane",
    "steroid",
    "steroids",
    "implant",
    "implants",
    "rhinoplasty",
    "diagnose",
    "diagnosis",
    "cure",
    "treats",
)

# Vocabulary of the looksmaxxing subculture. Researchers describe this language
# as part of a radicalisation pipeline, and using any of it groups us with the
# apps documented in docs/market.md. It must never appear in generated copy,
# in the UI, or in marketing.
SUBCULTURE_TERMS: tuple[str, ...] = (
    "psl",
    "looksmax",
    "looksmaxxing",
    "mog",
    "mogging",
    "mogged",
    "ascension",
    "ascend",
    "normie",
    "chad",
    "incel",
    "blackpill",
    "black pill",
    "subhuman",
    "tier",
    "mewing",
)

FORBIDDEN_TOPICS: tuple[str, ...] = MEDICAL_TERMS + SUBCULTURE_TERMS

# Word-boundary matching so "tier" does not fire on "tiered" only by accident,
# and so "mog" does not match inside "mogul".
_PATTERN = re.compile(
    r"\b(" + "|".join(re.escape(term) for term in FORBIDDEN_TOPICS) + r")\b",
    re.IGNORECASE,
)


def policy_violations(text: str) -> list[str]:
    """Return every blocked term found in ``text``, lowercased and deduplicated.

    Run this over any copy destined for a user — generated recommendations,
    but also hardcoded strings if you are unsure. An empty list means clean.
    """
    return sorted({match.group(1).lower() for match in _PATTERN.finditer(text)})


def generate(metrics: list[MetricResult], goals: list[str], locale: str) -> list[Recommendation]:
    """TODO(faz-2): rule-based selection, then Claude for the personalised copy.

    Every generated recommendation must pass ``policy_violations`` before it is
    written to the database. A violation is a bug in the prompt, not something
    to strip silently — log it so the prompt gets fixed.
    """
    raise NotImplementedError("recommendations land in Faz 2")

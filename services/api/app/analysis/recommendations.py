"""Recommendation generation.

Input is the metric table, never the image. Two consequences:
  1. No face data leaves our infrastructure for the LLM call.
  2. Every recommendation is attributable to a measurement, so the UI can show
     *why* it was given.

Generated copy is checked against the blocklists below before it is stored. See
docs/compliance.md for why each list exists.
"""

import re

from app.schemas import Measurement, MetricChange, Recommendation

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
#
# The subculture's English terms travel into Turkish as loanwords, but it has
# also grown native Turkish phrasings that an English-only blocklist misses
# entirely. Both sets are screened.
SUBCULTURE_TERMS_EN: tuple[str, ...] = (
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

# Turkish-language equivalents. "Kaçıncı ligdesin" (what league are you in) and
# "hangi tier" are the native phrasings; "çekicilik puanı" and "güzellik puanı"
# are the rating framing we refuse on positioning grounds even though they are
# not subculture slang.
SUBCULTURE_TERMS_TR: tuple[str, ...] = (
    "lig",
    "ligdesin",
    "seviye atlama",
    "çekicilik puanı",
    "güzellik puanı",
    "yüz puanı",
    "kaçıncı",
    "altın oran maskesi",
)

SUBCULTURE_TERMS: tuple[str, ...] = SUBCULTURE_TERMS_EN + SUBCULTURE_TERMS_TR

FORBIDDEN_TOPICS: tuple[str, ...] = MEDICAL_TERMS + SUBCULTURE_TERMS

# Turkish has a dotted/dotless i distinction that Python's default casing does
# not honour: "PUANI".lower() yields "puani", not "puanı", so upper-cased
# Turkish copy would slip past a naive case-insensitive match. Fold both pairs
# onto one character before matching. Folding can only widen what the blocklist
# catches, which is the safe direction for a blocklist.
def _normalise(text: str) -> str:
    # Order matters. Lower the two Turkish capital I forms by hand first, since
    # str.lower() maps "I" to "i" rather than "ı", then collapse the dotted and
    # dotless forms onto one character. Doing the collapse in a single
    # translate() would leave an "İ" that had just become "i" unfolded.
    return text.replace("İ", "i").replace("I", "ı").lower().replace("i", "ı").lower()


# Longest-first so a multi-word term is reported as itself rather than as one of
# its shorter constituents. Word boundaries keep "mog" out of "mogul" and "cure"
# out of "curetted".
_TERMS_BY_LENGTH: tuple[str, ...] = tuple(sorted(FORBIDDEN_TOPICS, key=len, reverse=True))

_PATTERN = re.compile(
    r"\b(" + "|".join(re.escape(_normalise(term)) for term in _TERMS_BY_LENGTH) + r")\b",
)

# Maps a normalised match back to the canonical spelling we report.
_CANONICAL: dict[str, str] = {_normalise(term): term for term in FORBIDDEN_TOPICS}


def policy_violations(text: str) -> list[str]:
    """Return every blocked term found in ``text``, canonicalised and sorted.

    Run this over any copy destined for a user — generated recommendations, but
    also hardcoded strings if you are unsure. An empty list means clean.
    """
    found = {_CANONICAL[match.group(1)] for match in _PATTERN.finditer(_normalise(text))}
    return sorted(found)


def generate(
    measurements: list[Measurement],
    changes: list[MetricChange],
    goals: list[str],
    locale: str,
) -> list[Recommendation]:
    """TODO(faz-2): rule-based selection, then Claude for the personalised copy.

    The model receives the measurement table and what moved since the baseline,
    never the image. Two consequences: no face data leaves our infrastructure
    for the LLM call, and every recommendation is attributable to a measurement
    so the UI can show why it was given.

    Every generated recommendation must pass ``policy_violations`` before it is
    written to the database. A violation is a bug in the prompt, not something
    to strip silently — log it so the prompt gets fixed.

    Recommendations must also be evidence-backed. "Mewing" is the obvious
    counter-example and is blocked by name: there is no controlled evidence it
    changes adult facial structure, and this app serves adults only.
    """
    raise NotImplementedError("recommendations land in Faz 2")

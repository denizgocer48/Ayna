"""Copy shown to users must not carry medical claims or subculture vocabulary.

docs/compliance.md commits to this in writing; these tests make the commitment
enforceable.
"""

from app.analysis.recommendations import (
    FORBIDDEN_TOPICS,
    MEDICAL_TERMS,
    SUBCULTURE_TERMS,
    policy_violations,
)


def test_clean_copy_passes() -> None:
    text = (
        "Your jawline definition sits in the 42nd percentile. Lower sodium in the "
        "evening and keep sleep consistent for six weeks, then rescan."
    )
    assert policy_violations(text) == []


def test_medical_claims_are_caught() -> None:
    assert policy_violations("This routine treats acne") == ["treats"]
    assert policy_violations("Ask about a prescription retinoid") == ["prescription"]


def test_subculture_vocabulary_is_caught() -> None:
    assert policy_violations("Your PSL rating is low-tier") == ["psl", "tier"]
    assert policy_violations("Start mewing to ascend") == ["ascend", "mewing"]


def test_matching_respects_word_boundaries() -> None:
    # "mogul" contains "mog"; "curetted" contains "cure". Neither is a violation.
    assert policy_violations("a media mogul") == []
    assert policy_violations("curetted the surface") == []


def test_violations_are_deduplicated_and_sorted() -> None:
    assert policy_violations("Botox, botox and more BOTOX") == ["botox"]


def test_blocklist_has_no_duplicates() -> None:
    assert len(FORBIDDEN_TOPICS) == len(set(FORBIDDEN_TOPICS))
    assert not set(MEDICAL_TERMS) & set(SUBCULTURE_TERMS)

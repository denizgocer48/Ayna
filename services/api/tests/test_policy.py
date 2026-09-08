"""Copy shown to users must not carry medical claims or subculture vocabulary.

docs/compliance.md commits to this in writing; these tests make the commitment
enforceable.
"""

from app.analysis.recommendations import (
    FORBIDDEN_TOPICS,
    MEDICAL_TERMS,
    SUBCULTURE_TERMS,
    SUBCULTURE_TERMS_TR,
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


def test_turkish_subculture_phrasings_are_caught() -> None:
    # An English-only blocklist misses these entirely — they are the native
    # Turkish phrasings of the same framing, not transliterations.
    assert policy_violations("Kaçıncı ligdesin?") == ["kaçıncı", "ligdesin"]
    assert policy_violations("Çekicilik puanı hesaplandı") == ["çekicilik puanı"]


def test_turkish_dotless_i_does_not_defeat_the_blocklist() -> None:
    # "PUANI".lower() is "puani", not "puanı", so upper-cased Turkish copy used
    # to slip through. Every casing must be caught.
    for variant in ("güzellik puanı", "GÜZELLIK PUANI", "Güzellik Puanı", "GÜZELLİK PUANI"):
        assert policy_violations(variant) == ["güzellik puanı"], variant


def test_matching_respects_word_boundaries() -> None:
    # "mogul" contains "mog"; "curetted" contains "cure". Neither is a violation.
    assert policy_violations("a media mogul") == []
    assert policy_violations("curetted the surface") == []


def test_violations_are_deduplicated_and_sorted() -> None:
    assert policy_violations("Botox, botox and more BOTOX") == ["botox"]


def test_blocklist_has_no_duplicates() -> None:
    assert len(FORBIDDEN_TOPICS) == len(set(FORBIDDEN_TOPICS))
    assert not set(MEDICAL_TERMS) & set(SUBCULTURE_TERMS)


def test_both_languages_are_screened() -> None:
    # Regression guard: the blocklist was English-only until the Turkish
    # phrasings were found missing. Do not let that happen again.
    assert SUBCULTURE_TERMS_TR
    assert set(SUBCULTURE_TERMS_TR) <= set(SUBCULTURE_TERMS)

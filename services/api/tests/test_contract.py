"""Guards the TypeScript <-> Python metric contract.

packages/shared/src/metrics.ts is the source of truth. If a key, its metadata or
its group membership drifts, the mobile app renders something the API never
returns. This test makes that a build failure instead of a runtime surprise.
"""

import re
from pathlib import Path

from app.schemas import METRIC_GROUPS, METRIC_KEYS, METRIC_META

SHARED = Path(__file__).resolve().parents[3] / "packages" / "shared" / "src" / "metrics.ts"
SOURCE = SHARED.read_text()

# Whitespace-tolerant on purpose: the catalogue may be reformatted, and a
# reformat must not silently stop the contract from being checked.
META_ROW = re.compile(
    r"(\w+):\s*\{\s*"
    r"unit:\s*'(\w+)',\s*"
    r"provenance:\s*'(\w+)',\s*"
    r"mutability:\s*'(\w+)',\s*"
    r"pose:\s*'(\w+)',\s*"
    r"direction:\s*'(\w+)',?\s*\},"
)


def _ts_metric_keys() -> list[str]:
    block = SOURCE.split("export const METRIC_KEYS = [", 1)[1].split("] as const;", 1)[0]
    return re.findall(r"'([a-z_]+)'", block)


def _ts_metric_meta() -> dict[str, tuple[str, str, str, str, str]]:
    block = SOURCE.split("export const METRIC_META = {", 1)[1].split("} as const satisfies", 1)[0]
    return {
        key: (unit, provenance, mutability, pose, direction)
        for key, unit, provenance, mutability, pose, direction in META_ROW.findall(block)
    }


def _ts_metric_groups() -> dict[str, list[str]]:
    block = SOURCE.split("export const METRIC_GROUPS = {", 1)[1].split("} as const satisfies", 1)[0]
    groups: dict[str, list[str]] = {}
    for name, body in re.findall(r"(\w+):\s*\[([^\]]*)\]", block):
        groups[name] = re.findall(r"'([a-z_]+)'", body)
    return groups


def test_metric_keys_match_typescript() -> None:
    assert list(METRIC_KEYS) == _ts_metric_keys()


def test_the_parser_actually_found_something() -> None:
    # Guards against a reformat quietly turning the metadata check into a
    # comparison of two empty dictionaries, which would pass.
    assert len(_ts_metric_meta()) == len(METRIC_KEYS)


def test_metric_metadata_matches_typescript() -> None:
    ours = {
        key: (
            meta["unit"],
            meta["provenance"],
            meta["mutability"],
            meta["pose"],
            meta["direction"],
        )
        for key, meta in METRIC_META.items()
    }
    assert ours == _ts_metric_meta()


def test_metric_groups_match_typescript() -> None:
    ours = {name: list(keys) for name, keys in METRIC_GROUPS.items()}
    assert ours == _ts_metric_groups()


def test_noise_floors_cover_every_mutability_class() -> None:
    from app.schemas import NOISE_FLOOR

    assert set(NOISE_FLOOR) == {meta["mutability"] for meta in METRIC_META.values()} | {
        "responsive"
    }


def test_fixed_metrics_have_an_infinite_noise_floor() -> None:
    # A fixed metric must never clear the floor, whatever it measures.
    from app.schemas import NOISE_FLOOR

    assert NOISE_FLOOR["fixed"] == float("inf")


def test_every_metric_belongs_to_exactly_one_group() -> None:
    grouped = [key for keys in METRIC_GROUPS.values() for key in keys]
    assert sorted(grouped) == sorted(METRIC_KEYS)
    assert len(grouped) == len(set(grouped))

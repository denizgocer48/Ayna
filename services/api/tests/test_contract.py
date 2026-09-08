"""Guards the TypeScript <-> Python metric contract.

packages/shared/src/metrics.ts is the source of truth. If a key is added there
and not here (or vice versa), the mobile app renders a metric the API never
returns. This test makes that a build failure instead of a runtime surprise.
"""

import re
from pathlib import Path

from app.schemas import METRIC_GROUPS, METRIC_KEYS

SHARED = Path(__file__).resolve().parents[3] / "packages" / "shared" / "src" / "metrics.ts"


def _ts_metric_keys() -> list[str]:
    source = SHARED.read_text()
    block = source.split("export const METRIC_KEYS = [", 1)[1].split("] as const;", 1)[0]
    return re.findall(r"'([a-z_]+)'", block)


def test_metric_keys_match_typescript() -> None:
    assert list(METRIC_KEYS) == _ts_metric_keys()


def test_every_metric_belongs_to_exactly_one_group() -> None:
    grouped = [key for keys in METRIC_GROUPS.values() for key in keys]
    assert sorted(grouped) == sorted(METRIC_KEYS)
    assert len(grouped) == len(set(grouped))

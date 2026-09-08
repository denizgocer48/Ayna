from fastapi import APIRouter, HTTPException, status

from app.core.security import CurrentUser
from app.schemas import CreateScanRequest, CreateScanResponse, ScanResult

router = APIRouter(prefix="/scans", tags=["scans"])


@router.post("", response_model=CreateScanResponse, status_code=status.HTTP_202_ACCEPTED)
async def create_scan(payload: CreateScanRequest, user_id: CurrentUser) -> CreateScanResponse:
    """Queue an analysis and return immediately.

    Inference takes seconds; holding the request open for it wastes a worker and
    times out on poor mobile connections. The client polls GET /scans/{id}.

    TODO(faz-2), in this order — each is a hard gate, not a warning:
      1. Reject when the caller has no live biometric consent.
      2. Reject when the caller is out of quota (one free scan, then an active
         entitlement). The RLS policy `can_start_scan` also enforces this; the
         check here exists to return a useful error code instead of a policy
         violation the client cannot interpret.
      3. Reject when any image reports `quality.ok == false`. The device already
         gates this, but a client is not a trust boundary.
      4. Require exactly one front image; a side image is optional and unlocks
         the true jaw and profile metrics.
      5. Insert the scan and its images, enqueue the Celery job.
    """
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail={"error": {"code": "not_implemented", "message": "Analysis lands in Faz 2"}},
    )


@router.get("/{scan_id}", response_model=ScanResult)
async def get_scan(scan_id: str, user_id: CurrentUser) -> ScanResult:
    """Read one scan.

    TODO(faz-2): enforce ownership, and set `locked` from the caller's
    entitlement. A locked result still carries `overall` and `reachable` — the
    user must see their real baseline and the size of their gap before being
    asked to pay — but omits the per-metric breakdown.
    """
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail={"error": {"code": "not_implemented", "message": "Analysis lands in Faz 2"}},
    )


@router.delete("/{scan_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_scan(scan_id: str, user_id: CurrentUser) -> None:
    """Delete a scan and everything derived from it.

    Not optional and not deferrable: deletion is a legal requirement, so it
    ships with the first release. Cascades cover metrics and scores; the storage
    object has to be removed explicitly.

    TODO(faz-1): implement.
    """
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail={"error": {"code": "not_implemented", "message": "Deletion lands in Faz 1"}},
    )

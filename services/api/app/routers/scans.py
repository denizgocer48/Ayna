from fastapi import APIRouter, HTTPException, status

from app.core.security import CurrentUser
from app.schemas import CreateScanRequest, CreateScanResponse, ScanResult

router = APIRouter(prefix="/scans", tags=["scans"])


@router.post("", response_model=CreateScanResponse, status_code=status.HTTP_202_ACCEPTED)
async def create_scan(payload: CreateScanRequest, user_id: CurrentUser) -> CreateScanResponse:
    """Queue an analysis and return immediately.

    Inference takes seconds; holding the request open for it wastes a worker and
    times out on poor mobile connections. The client polls GET /scans/{id}.

    TODO(faz-2):
      1. Reject when the caller has no valid biometric consent on file.
      2. Reject when payload.quality.ok is false — trust but verify server-side.
      3. Enqueue the Celery job, insert the scan row as `pending`.
    """
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail={"error": {"code": "not_implemented", "message": "Analysis lands in Faz 2"}},
    )


@router.get("/{scan_id}", response_model=ScanResult)
async def get_scan(scan_id: str, user_id: CurrentUser) -> ScanResult:
    """TODO(faz-2): read the scan, enforcing that it belongs to ``user_id``."""
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail={"error": {"code": "not_implemented", "message": "Analysis lands in Faz 2"}},
    )

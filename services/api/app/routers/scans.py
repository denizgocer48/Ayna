from fastapi import APIRouter, HTTPException, status

from app.core.security import CurrentUser
from app.schemas import CreateScanRequest, CreateScanResponse, ScanResult

router = APIRouter(prefix="/scans", tags=["scans"])


@router.post("", response_model=CreateScanResponse, status_code=status.HTTP_201_CREATED)
async def create_scan(payload: CreateScanRequest, user_id: CurrentUser) -> CreateScanResponse:
    """Record a scan that the device has already measured.

    Returns 201 rather than 202: there is no queue and nothing to poll. Analysis
    finished on the phone before this request was made, and the server receives
    numbers rather than pixels.

    TODO(faz-2), in this order — each is a hard gate, not a warning:
      1. Reject when the caller has no live biometric consent.
      2. Reject when the caller is out of quota. The RLS policy `can_start_scan`
         also enforces this; the check here exists to return a useful error code
         rather than a policy violation the client cannot interpret.
      3. Reject when any capture reports `quality.ok == false`. The device
         already gates this, but a client is not a trust boundary.
      4. Reject measurement keys outside the catalogue, and require exactly one
         front capture.
      5. Insert the scan, its captures and its measurements; compute progress
         against `baseline_scan_id(user)` and return it.
    """
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail={"error": {"code": "not_implemented", "message": "Scan intake lands in Faz 2"}},
    )


@router.get("/{scan_id}", response_model=ScanResult)
async def get_scan(scan_id: str, user_id: CurrentUser) -> ScanResult:
    """Read one scan.

    TODO(faz-2): enforce ownership, and set `locked` from the caller's
    entitlement. A locked result still carries the measurements from the user's
    own baseline scan — that is theirs — but omits the full breakdown and the
    routine.
    """
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail={"error": {"code": "not_implemented", "message": "Scan reads land in Faz 2"}},
    )


@router.delete("/{scan_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_scan(scan_id: str, user_id: CurrentUser) -> None:
    """Delete a scan and everything derived from it.

    Not optional and not deferrable: deletion is a legal requirement, so it
    ships with the first release. Cascades cover captures and measurements.
    There is no stored image to remove — the device holds those, and the app
    deletes its local copy in the same action.

    TODO(faz-1): implement.
    """
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail={"error": {"code": "not_implemented", "message": "Deletion lands in Faz 1"}},
    )

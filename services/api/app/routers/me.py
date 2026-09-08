from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

from app.core.security import CurrentUser

router = APIRouter(prefix="/me", tags=["me"])


class QuotaResponse(BaseModel):
    used: int
    allowance: int
    canScan: bool
    entitled: bool


@router.get("/quota", response_model=QuotaResponse)
async def quota(user_id: CurrentUser) -> QuotaResponse:
    """What the client needs to decide between the shutter and the paywall.

    TODO(faz-4): count scans, read the entitlement, mirror `can_start_scan`.
    """
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail={"error": {"code": "not_implemented", "message": "Quota lands in Faz 4"}},
    )

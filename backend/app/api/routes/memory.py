from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends

from app.api.deps import get_current_user_id
from app.schemas.memory import MemoryProfileResponse
from app.services.qdrant_service import get_user_profile

router = APIRouter(prefix="/memory")


@router.get("/profile", response_model=MemoryProfileResponse)
def get_memory_profile(user_id: uuid.UUID = Depends(get_current_user_id)) -> MemoryProfileResponse:
    profile = get_user_profile(user_id)
    return MemoryProfileResponse(user_id=str(user_id), profile=profile)


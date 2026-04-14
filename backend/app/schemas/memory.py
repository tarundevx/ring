from __future__ import annotations

from pydantic import BaseModel


class MemoryProfileResponse(BaseModel):
    user_id: str
    profile: dict


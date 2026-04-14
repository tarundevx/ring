from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, Field

from app.schemas.common import ORMModel


class ConversationCreate(BaseModel):
    transcript: str = Field(min_length=1)
    duration_seconds: int | None = None
    tags: list[str] | None = None


class ConversationResponse(ORMModel):
    id: uuid.UUID
    user_id: uuid.UUID
    transcript: str
    summary: str | None
    duration_seconds: int | None
    created_at: datetime
    tags: list[str] | None


class ConversationDetail(BaseModel):
    conversation: ConversationResponse
    extracted_tasks: list[dict]
    extracted_reminders: list[dict]


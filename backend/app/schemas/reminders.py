from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel

from app.schemas.common import ORMModel


class ReminderCreate(BaseModel):
    title: str
    body: str | None = None
    remind_at: datetime
    source_conversation_id: uuid.UUID | None = None


class ReminderPatch(BaseModel):
    status: str | None = None
    remind_at: datetime | None = None


class ReminderResponse(ORMModel):
    id: uuid.UUID
    user_id: uuid.UUID
    title: str
    body: str | None
    remind_at: datetime
    status: str
    source_conversation_id: uuid.UUID | None
    created_at: datetime


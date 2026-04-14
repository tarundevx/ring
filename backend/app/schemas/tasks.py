from __future__ import annotations

import uuid
from datetime import date, datetime

from pydantic import BaseModel

from app.schemas.common import ORMModel


class TaskCreate(BaseModel):
    title: str
    description: str | None = None
    due_date: date | None = None
    priority: str = "medium"
    linked_conversation_id: uuid.UUID | None = None


class TaskPatch(BaseModel):
    title: str | None = None
    description: str | None = None
    status: str | None = None
    due_date: date | None = None
    priority: str | None = None


class TaskResponse(ORMModel):
    id: uuid.UUID
    user_id: uuid.UUID
    title: str
    description: str | None
    status: str
    priority: str
    due_date: date | None
    source_conversation_id: uuid.UUID | None
    created_at: datetime


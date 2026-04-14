from __future__ import annotations

import uuid
from pydantic import BaseModel, Field


class ContextRetrieveRequest(BaseModel):
    query: str = Field(min_length=1)
    user_id: uuid.UUID
    limit: int = 5


class ContextChunk(BaseModel):
    score: float
    conversation_id: str
    chunk_index: int
    text: str
    tags: list[str]
    timestamp: str


class ContextRetrieveResponse(BaseModel):
    matches: list[ContextChunk]


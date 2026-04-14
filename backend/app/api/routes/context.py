from __future__ import annotations

from fastapi import APIRouter

from app.schemas.context import ContextRetrieveRequest, ContextRetrieveResponse
from app.services.embeddings import embed_text
from app.services.qdrant_service import search_user_context

router = APIRouter(prefix="/context")


@router.post("/retrieve", response_model=ContextRetrieveResponse)
def retrieve_context(payload: ContextRetrieveRequest) -> ContextRetrieveResponse:
    query_embedding = embed_text(payload.query)
    matches = search_user_context(payload.user_id, query_embedding, payload.limit)
    return ContextRetrieveResponse(matches=matches)


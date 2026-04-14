from __future__ import annotations

from datetime import datetime
from typing import Any
from uuid import UUID

from qdrant_client import QdrantClient
from qdrant_client.http.models import Distance, FieldCondition, Filter, MatchValue, PointStruct, VectorParams

from app.core.config import settings

_client: QdrantClient | None = None


def _get_client() -> QdrantClient:
    global _client
    if _client is None:
        _client = QdrantClient(url=settings.qdrant_url, api_key=settings.qdrant_api_key)
    return _client


def ensure_collections() -> None:
    client = _get_client()
    for collection in (settings.qdrant_conversations_collection, settings.qdrant_user_profiles_collection):
        if not client.collection_exists(collection):
            client.create_collection(
                collection_name=collection,
                vectors_config=VectorParams(size=1536, distance=Distance.COSINE),
            )


def upsert_conversation_chunks(user_id: UUID, conversation_id: UUID, chunks: list[str], embeddings: list[list[float]], tags: list[str] | None) -> None:
    client = _get_client()
    timestamp = datetime.utcnow().isoformat()
    points: list[PointStruct] = []
    for idx, (chunk, vector) in enumerate(zip(chunks, embeddings, strict=True)):
        points.append(
            PointStruct(
                id=f"{conversation_id}:{idx}",
                vector=vector,
                payload={
                    "user_id": str(user_id),
                    "conversation_id": str(conversation_id),
                    "chunk_index": idx,
                    "text": chunk,
                    "timestamp": timestamp,
                    "tags": tags or [],
                },
            )
        )
    client.upsert(collection_name=settings.qdrant_conversations_collection, points=points)


def search_user_context(user_id: UUID, embedding: list[float], limit: int = 5) -> list[dict[str, Any]]:
    client = _get_client()
    results = client.search(
        collection_name=settings.qdrant_conversations_collection,
        query_vector=embedding,
        query_filter=Filter(must=[FieldCondition(key="user_id", match=MatchValue(value=str(user_id)))]),
        limit=limit,
        with_payload=True,
    )
    return [
        {
            "score": result.score,
            "conversation_id": result.payload.get("conversation_id"),
            "chunk_index": result.payload.get("chunk_index"),
            "text": result.payload.get("text"),
            "tags": result.payload.get("tags", []),
            "timestamp": result.payload.get("timestamp", ""),
        }
        for result in results
    ]


def get_user_profile(user_id: UUID) -> dict:
    client = _get_client()
    points, _ = client.scroll(
        collection_name=settings.qdrant_user_profiles_collection,
        scroll_filter=Filter(must=[FieldCondition(key="user_id", match=MatchValue(value=str(user_id)))]),
        with_payload=True,
        limit=1,
    )
    if not points:
        return {"people": [], "projects": [], "preferences": [], "topics": []}
    return points[0].payload.get("profile", {})


def upsert_user_profile(user_id: UUID, profile: dict, embedding: list[float]) -> None:
    client = _get_client()
    point = PointStruct(id=str(user_id), vector=embedding, payload={"user_id": str(user_id), "profile": profile})
    client.upsert(collection_name=settings.qdrant_user_profiles_collection, points=[point])


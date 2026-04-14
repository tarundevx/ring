from __future__ import annotations

import asyncio
import contextlib
import json

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.config import settings
from app.services.qdrant_service import ensure_collections
from app.services.notification_manager import notification_manager
from app.services.redis_bus import NOTIFICATION_CHANNEL, get_async_redis

app = FastAPI(title="Ring API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)

_subscriber_task: asyncio.Task | None = None


async def _notification_subscriber() -> None:
    redis = get_async_redis()
    pubsub = redis.pubsub()
    await pubsub.subscribe(NOTIFICATION_CHANNEL)
    try:
        async for message in pubsub.listen():
            if message["type"] != "message":
                continue
            payload = json.loads(message["data"])
            await notification_manager.send(payload["user_id"], payload)
    finally:
        await pubsub.unsubscribe(NOTIFICATION_CHANNEL)
        await pubsub.close()
        await redis.close()


@app.on_event("startup")
async def startup() -> None:
    ensure_collections()
    global _subscriber_task
    _subscriber_task = asyncio.create_task(_notification_subscriber())


@app.on_event("shutdown")
async def shutdown() -> None:
    global _subscriber_task
    if _subscriber_task:
        _subscriber_task.cancel()
        with contextlib.suppress(asyncio.CancelledError):
            await _subscriber_task


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


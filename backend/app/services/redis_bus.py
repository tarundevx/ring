from __future__ import annotations

import json

from redis import Redis
from redis.asyncio import Redis as AsyncRedis

from app.core.config import settings

NOTIFICATION_CHANNEL = "ring.notifications"


def get_sync_redis() -> Redis:
    return Redis.from_url(settings.redis_url, decode_responses=True)


def get_async_redis() -> AsyncRedis:
    return AsyncRedis.from_url(settings.redis_url, decode_responses=True)


def publish_notification(payload: dict) -> None:
    client = get_sync_redis()
    client.publish(NOTIFICATION_CHANNEL, json.dumps(payload))


from __future__ import annotations

import asyncio
from app.services.notification_manager import notification_manager

def publish_notification(payload: dict) -> None:
    try:
        loop = asyncio.get_running_loop()
        # Default UUID if none provided
        user_id = payload.get("user_id", "00000000-0000-0000-0000-000000000000")
        loop.create_task(notification_manager.send(user_id, payload))
    except RuntimeError:
        pass



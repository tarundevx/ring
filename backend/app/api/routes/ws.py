from __future__ import annotations

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.services.notification_manager import notification_manager

router = APIRouter()


@router.websocket("/ws/notifications/{user_id}")
async def notifications_ws(user_id: str, websocket: WebSocket) -> None:
    await notification_manager.connect(user_id, websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        await notification_manager.disconnect(user_id, websocket)


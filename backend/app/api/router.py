from fastapi import APIRouter

from app.api.routes import context, conversations, memory, reminders, tasks, ws

api_router = APIRouter(prefix="/api")
api_router.include_router(conversations.router, tags=["conversations"])
api_router.include_router(context.router, tags=["context"])
api_router.include_router(tasks.router, tags=["tasks"])
api_router.include_router(reminders.router, tags=["reminders"])
api_router.include_router(memory.router, tags=["memory"])
api_router.include_router(ws.router, tags=["websocket"])


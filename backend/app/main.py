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

app = FastAPI(title="Ring API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin, "http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*", "x-user-id"],
    expose_headers=["*"],
)

app.include_router(api_router)

@app.on_event("startup")
async def startup() -> None:
    try:
        from app.db.base import Base
        from app.db.session import engine
        # In development, it's easier to auto-create tables
        Base.metadata.create_all(bind=engine)
        ensure_collections()
    except Exception as e:
        print(f"Error during startup: {e}")

@app.on_event("shutdown")
async def shutdown() -> None:
    pass


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


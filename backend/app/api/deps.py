from __future__ import annotations

import uuid

from fastapi import Header, HTTPException
import jwt
from jwt import PyJWTError

from app.core.config import settings


def get_current_user_id(authorization: str | None = Header(default=None), x_user_id: str | None = Header(default=None)) -> uuid.UUID:
    if authorization and settings.supabase_jwt_secret:
        token = authorization.removeprefix("Bearer ").strip()
        try:
            payload = jwt.decode(token, settings.supabase_jwt_secret, algorithms=["HS256"], options={"verify_aud": False})
            return uuid.UUID(payload["sub"])
        except (PyJWTError, ValueError, KeyError) as exc:
            raise HTTPException(status_code=401, detail="Invalid auth token") from exc

    if not x_user_id:
        raise HTTPException(status_code=400, detail="Missing x-user-id header")

    try:
        return uuid.UUID(x_user_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="Invalid x-user-id header") from exc


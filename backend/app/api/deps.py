from __future__ import annotations

import uuid

from fastapi import Header, HTTPException
import jwt
from jwt import PyJWTError

from app.core.config import settings


def get_current_user_id() -> uuid.UUID:
    return uuid.UUID("00000000-0000-0000-0000-000000000000")


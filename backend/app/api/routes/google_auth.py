from __future__ import annotations

from fastapi import APIRouter, Depends, Query, HTTPException
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from app.api.deps import get_current_user_id
from app.db.session import get_db
from app.services.google_service import GoogleService
from app.core.config import settings
from app.db.models import GoogleToken

router = APIRouter(prefix="/auth/google")

@router.get("/authorize")
def authorize_google(
    db: Session = Depends(get_db),
    user_id = Depends(get_current_user_id),
):
    google_service = GoogleService(db, user_id)
    return {"url": google_service.get_auth_url()}

@router.get("/callback")
def google_callback(
    code: str,
    db: Session = Depends(get_db),
    # For local testing without complex auth, we might need a way to pass user_id back.
    # But usually, it's stored in session/state. Since we have get_current_user_id 
    # relying on headers (which redirect doesn't have), we'll assume a simpler mock for now
    # or suggest the user handle the state parameter for production.
):
    # Mocking user_id for simplicity in this local setup if headers are missing
    # In a real app, 'state' would carry the encrypted session/user info
    from app.api.deps import get_current_user_id
    try:
        user_id = get_current_user_id() # This returns the mock UUID 000...000
    except:
        from uuid import UUID
        user_id = UUID("00000000-0000-0000-0000-000000000000")

    google_service = GoogleService(db, user_id)
    google_service.handle_callback(code)
    
    # Redirect back to apps page
    return RedirectResponse(url=f"{settings.frontend_origin}/dashboard/apps?status=success")

@router.get("/status")
def google_status(
    db: Session = Depends(get_db),
    user_id = Depends(get_current_user_id),
):
    google_service = GoogleService(db, user_id)
    return google_service.get_status()

@router.post("/settings")
def update_google_settings(
    update: dict,
    db: Session = Depends(get_db),
    user_id = Depends(get_current_user_id),
):
    google_service = GoogleService(db, user_id)
    google_service.update_settings(update)
    return {"ok": True}

@router.post("/disconnect")
def disconnect_google(
    db: Session = Depends(get_db),
    user_id = Depends(get_current_user_id),
):
    token = db.get(GoogleToken, user_id)
    if token:
        db.delete(token)
        db.commit()
    return {"ok": True}

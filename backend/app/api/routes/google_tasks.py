from __future__ import annotations

from typing import Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user_id
from app.db.session import get_db
from app.services.google_tools import get_calendar_tools, get_drive_tools, get_gmail_tools

router = APIRouter(prefix="/google")

@router.get("/calendar/list")
def list_calendar_events(
    db: Session = Depends(get_db),
    user_id = Depends(get_current_user_id),
):
    tools = get_calendar_tools(db, user_id)
    if "list_upcoming_events" not in tools:
        return {"error": "Google Calendar not connected"}
    return {"events": tools["list_upcoming_events"]()}

@router.post("/calendar/schedule")
def schedule_calendar_event(
    event: dict,
    db: Session = Depends(get_db),
    user_id = Depends(get_current_user_id),
):
    tools = get_calendar_tools(db, user_id)
    if "schedule_event" not in tools:
        return {"error": "Google Calendar not connected"}
    return tools["schedule_event"](**event)

@router.get("/drive/search")
def search_drive(
    query: str,
    db: Session = Depends(get_db),
    user_id = Depends(get_current_user_id),
):
    tools = get_drive_tools(db, user_id)
    if "search_drive_files" not in tools:
        return {"error": "Google Drive not connected"}
    return {"files": tools["search_drive_files"](query)}

@router.get("/drive/read")
def read_drive_file(
    file_id: str,
    db: Session = Depends(get_db),
    user_id = Depends(get_current_user_id),
):
    tools = get_drive_tools(db, user_id)
    if "read_drive_file" not in tools:
        return {"error": "Google Drive not connected"}
    return {"content": tools["read_drive_file"](file_id)}

@router.get("/gmail/list")
def list_emails(
    db: Session = Depends(get_db),
    user_id = Depends(get_current_user_id),
):
    tools = get_gmail_tools(db, user_id)
    if "list_recent_emails" not in tools:
        return {"error": "Gmail not connected"}
    return {"emails": tools["list_recent_emails"]()}

@router.post("/gmail/draft")
def draft_gmail(
    email: dict,
    db: Session = Depends(get_db),
    user_id = Depends(get_current_user_id),
):
    tools = get_gmail_tools(db, user_id)
    if "draft_email" not in tools:
        return {"error": "Gmail not connected"}
    return tools["draft_email"](**email)

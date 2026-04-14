from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user_id
from app.db.models import Reminder
from app.db.session import get_db
from app.schemas.reminders import ReminderCreate, ReminderPatch, ReminderResponse

router = APIRouter(prefix="/reminders")


@router.get("", response_model=list[ReminderResponse])
def list_reminders(db: Session = Depends(get_db), user_id: uuid.UUID = Depends(get_current_user_id)) -> list[ReminderResponse]:
    items = db.scalars(select(Reminder).where(Reminder.user_id == user_id).order_by(Reminder.remind_at.asc())).all()
    return [ReminderResponse.model_validate(item) for item in items]


@router.post("", response_model=ReminderResponse)
def create_reminder(payload: ReminderCreate, db: Session = Depends(get_db), user_id: uuid.UUID = Depends(get_current_user_id)) -> ReminderResponse:
    reminder = Reminder(
        user_id=user_id,
        title=payload.title,
        body=payload.body,
        remind_at=payload.remind_at,
        source_conversation_id=payload.source_conversation_id,
    )
    db.add(reminder)
    db.commit()
    db.refresh(reminder)
    return ReminderResponse.model_validate(reminder)


@router.patch("/{reminder_id}", response_model=ReminderResponse)
def patch_reminder(
    reminder_id: uuid.UUID,
    payload: ReminderPatch,
    db: Session = Depends(get_db),
    user_id: uuid.UUID = Depends(get_current_user_id),
) -> ReminderResponse:
    reminder = db.get(Reminder, reminder_id)
    if not reminder or reminder.user_id != user_id:
        raise HTTPException(status_code=404, detail="Reminder not found")
    updates = payload.model_dump(exclude_none=True)
    for key, value in updates.items():
        setattr(reminder, key, value)
    db.add(reminder)
    db.commit()
    db.refresh(reminder)
    return ReminderResponse.model_validate(reminder)


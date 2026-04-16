from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user_id
from app.db.models import Conversation, Reminder, Task
from app.db.session import get_db
from app.schemas.conversations import ConversationCreate, ConversationDetail, ConversationResponse
from app.services.conversation_pipeline import create_conversation, process_conversation

router = APIRouter(prefix="/conversations")


@router.post("", response_model=ConversationDetail)
def create_conversation_endpoint(
    payload: ConversationCreate,
    db: Session = Depends(get_db),
    user_id: uuid.UUID = Depends(get_current_user_id),
) -> ConversationDetail:
    conversation = create_conversation(db, user_id, payload.transcript, payload.duration_seconds, payload.tags)
    extracted = process_conversation(db, conversation)
    return ConversationDetail(
        conversation=ConversationResponse.model_validate(conversation),
        extracted_tasks=extracted["tasks"],
        extracted_reminders=extracted["reminders"],
        ai_extraction_skipped=extracted.get("ai_extraction_skipped", False),
    )


@router.get("", response_model=list[ConversationResponse])
def list_conversations(
    limit: int = Query(default=20, le=100),
    offset: int = 0,
    db: Session = Depends(get_db),
    user_id: uuid.UUID = Depends(get_current_user_id),
) -> list[ConversationResponse]:
    items = db.scalars(
        select(Conversation).where(Conversation.user_id == user_id).order_by(Conversation.created_at.desc()).offset(offset).limit(limit)
    ).all()
    return [ConversationResponse.model_validate(item) for item in items]


@router.get("/{conversation_id}", response_model=ConversationDetail)
def get_conversation(conversation_id: uuid.UUID, db: Session = Depends(get_db), user_id: uuid.UUID = Depends(get_current_user_id)) -> ConversationDetail:
    conversation = db.get(Conversation, conversation_id)
    if not conversation or conversation.user_id != user_id:
        raise HTTPException(status_code=404, detail="Conversation not found")
    tasks = db.scalars(select(Task).where(Task.source_conversation_id == conversation_id)).all()
    reminders = db.scalars(select(Reminder).where(Reminder.source_conversation_id == conversation_id)).all()
    return ConversationDetail(
        conversation=ConversationResponse.model_validate(conversation),
        extracted_tasks=[{"id": str(t.id), "title": t.title, "status": t.status, "due_date": str(t.due_date) if t.due_date else None} for t in tasks],
        extracted_reminders=[
            {"id": str(r.id), "title": r.title, "status": r.status, "remind_at": r.remind_at.isoformat()} for r in reminders
        ],
    )


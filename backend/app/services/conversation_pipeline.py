from __future__ import annotations

import uuid
from datetime import date, datetime

from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.db.models import Conversation, Reminder, Task
from app.services.chunking import chunk_transcript
from app.services.embeddings import embed_text
from app.services.llm_service import process_full_conversation
from app.services.qdrant_service import (
    ensure_collections,
    get_user_profile,
    upsert_conversation_chunks,
    upsert_user_profile,
)


def summarize(transcript: str) -> str:
    lines = [line.strip() for line in transcript.splitlines() if line.strip()]
    return " ".join(lines[:2])[:220]


def process_conversation(db: Session, conversation: Conversation) -> dict:
    chunks = chunk_transcript(conversation.transcript)
    embeddings = [embed_text(chunk) for chunk in chunks]
    ensure_collections()
    upsert_conversation_chunks(conversation.user_id, conversation.id, chunks, embeddings, conversation.tags)

    ai_error_type = None
    extracted_tasks = []
    extracted_reminders = []

    try:
        existing_profile = get_user_profile(conversation.user_id)
        full_res = process_full_conversation(conversation.transcript, existing_profile)
        
        extraction = full_res.get("extraction", {})
        extracted_tasks = extraction.get("action_items", [])
        extracted_reminders = extraction.get("reminders", [])

        for item in extracted_tasks:
            due_date_raw = item.get("due_date")
            due_date = None
            if due_date_raw:
                try:
                    due_date = date.fromisoformat(due_date_raw)
                except ValueError:
                    due_date = None
            task = Task(
                user_id=conversation.user_id,
                title=item.get("title", "Untitled task"),
                description=item.get("description"),
                due_date=due_date,
                source_conversation_id=conversation.id,
            )
            db.add(task)

        for item in extracted_reminders:
            remind_at = item.get("remind_at")
            parsed_remind_at = datetime.utcnow()
            reminder = Reminder(
                user_id=conversation.user_id,
                title=item.get("title", "Untitled reminder"),
                body=item.get("body"),
                remind_at=parsed_remind_at if not remind_at else datetime.fromisoformat(remind_at.replace("Z", "+00:00")),
                source_conversation_id=conversation.id,
            )
            db.add(reminder)
            
        merged_profile = full_res.get("updated_profile", existing_profile)
        profile_embedding = embed_text(str(merged_profile))
        upsert_user_profile(conversation.user_id, merged_profile, profile_embedding)

    except HTTPException as e:
        if e.status_code == 429:
            ai_error_type = "rate_limit"
            print(f"Extraction skipped due to rate limit: {e.detail}")
        else:
            raise e
    except Exception as e:
        print(f"Extraction failed with unexpected error: {str(e)}")
        ai_error_type = "other"

    db.commit()

    return {
        "tasks": extracted_tasks, 
        "reminders": extracted_reminders,
        "ai_error_type": ai_error_type
    }


def create_conversation(db: Session, user_id: uuid.UUID, transcript: str, duration_seconds: int | None, tags: list[str] | None) -> Conversation:
    conversation = Conversation(
        user_id=user_id,
        transcript=transcript,
        duration_seconds=duration_seconds,
        tags=tags,
        summary=summarize(transcript),
    )
    db.add(conversation)
    db.commit()
    db.refresh(conversation)
    return conversation

from __future__ import annotations

import uuid
from datetime import date, datetime

from sqlalchemy.orm import Session

from app.db.models import Conversation, Reminder, Task
from app.services.chunking import chunk_transcript
from app.services.embeddings import embed_text
from app.services.llm_service import extract_from_conversation, merge_memory_profile
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

    extraction = extract_from_conversation(conversation.transcript)
    extracted_tasks = extraction.get("action_items", [])
    extracted_reminders = extraction.get("reminders", [])

    for item in extracted_tasks:
        due_date_raw = item.get("due_date")
        due_date = None
        if due_date_raw:
            due_date = date.fromisoformat(due_date_raw)
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

    existing_profile = get_user_profile(conversation.user_id)
    merged_profile = merge_memory_profile(existing_profile, conversation.transcript)
    profile_embedding = embed_text(str(merged_profile))
    upsert_user_profile(conversation.user_id, merged_profile, profile_embedding)
    db.commit()

    return {"tasks": extracted_tasks, "reminders": extracted_reminders}


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


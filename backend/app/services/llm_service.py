from __future__ import annotations

import json
from typing import Any

from groq import Groq

from app.core.config import settings

_client: Groq | None = None


def _parse_json(text: str) -> dict[str, Any]:
    raw = text.strip()
    if raw.startswith("```"):
        raw = raw.split("\n", 1)[1]
        if raw.endswith("```"):
            raw = raw[:-3]
    return json.loads(raw.strip())


def _get_client() -> Groq:
    global _client
    if _client is None:
        if not settings.groq_api_key:
            raise RuntimeError("GROQ_API_KEY is not configured")
        _client = Groq(api_key=settings.groq_api_key)
    return _client


def extract_from_conversation(transcript: str) -> dict[str, Any]:
    from datetime import datetime
    current_time = datetime.now().isoformat()
    prompt = (
        f"Current Time: {current_time}\n"
        "Extract JSON with keys action_items, reminders, entities, topics.\n"
        "Each action item should include title, description, due_date(optional, YYYY-MM-DD).\n"
        "Each reminder should include title, body, remind_at (ISO datetime).\n"
        "Use the Current Time provided above to resolve relative dates like 'tomorrow', 'next week', 'in 2 hours', etc.\n"
        "Return JSON only.\n\n"
        f"Transcript:\n{transcript}"
    )
    
    response = _get_client().chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}]
    )
    return _parse_json(response.choices[0].message.content)


def merge_memory_profile(existing_profile: dict, transcript: str) -> dict:
    prompt = (
        "You are an identity-mapping engine. Analyze the conversation and the existing profile JSON.\n"
        "Extract ANY new facts, people, projects, preferences, or recurring topics mentioned.\n"
        "BE PROACTIVE: If the user mentions a friend's name, add it to 'people'. If they mention a hobby, add to 'preferences'.\n"
        "Return the full merged JSON profile with keys: people, projects, preferences, recurring_topics, facts.\n"
        "Ensure the output is valid JSON and contains only the updated profile.\n\n"
        f"Existing Profile:\n{json.dumps(existing_profile)}\n\nNew Conversation:\n{transcript}"
    )
    
    response = _get_client().chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}]
    )
    return _parse_json(response.choices[0].message.content)


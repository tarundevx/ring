from __future__ import annotations

import json
from typing import Any

from anthropic import Anthropic

from app.core.config import settings

_client: Anthropic | None = None


def _parse_json(text: str) -> dict[str, Any]:
    raw = text.strip()
    if raw.startswith("```"):
        raw = raw.split("\n", 1)[1]
        if raw.endswith("```"):
            raw = raw[:-3]
    return json.loads(raw.strip())


def _get_client() -> Anthropic:
    global _client
    if _client is None:
        if not settings.anthropic_api_key:
            raise RuntimeError("ANTHROPIC_API_KEY is not configured")
        _client = Anthropic(api_key=settings.anthropic_api_key)
    return _client


def extract_from_conversation(transcript: str) -> dict[str, Any]:
    prompt = (
        "Extract JSON with keys action_items, reminders, entities, topics.\n"
        "Each action item should include title, description, due_date(optional).\n"
        "Each reminder should include title, body, remind_at (ISO datetime).\n"
        "Return JSON only.\n\n"
        f"Transcript:\n{transcript}"
    )
    message = _get_client().messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1200,
        messages=[{"role": "user", "content": prompt}],
    )
    text = message.content[0].text if message.content else "{}"
    return _parse_json(text)


def merge_memory_profile(existing_profile: dict, transcript: str) -> dict:
    prompt = (
        "Given existing profile JSON and a new conversation, return merged updated JSON profile "
        "with keys: people, projects, preferences, recurring_topics, facts.\n"
        "Return JSON only.\n\n"
        f"Existing:\n{json.dumps(existing_profile)}\n\nConversation:\n{transcript}"
    )
    message = _get_client().messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1000,
        messages=[{"role": "user", "content": prompt}],
    )
    text = message.content[0].text if message.content else "{}"
    return _parse_json(text)


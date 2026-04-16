from __future__ import annotations

import json
from typing import Any

from google import genai

from app.core.config import settings

from google.genai.errors import ClientError, APIError
from fastapi import HTTPException

_client: genai.Client | None = None


def _parse_json(text: str) -> dict[str, Any]:
    raw = text.strip()
    if raw.startswith("```"):
        raw = raw.split("\n", 1)[1]
        if raw.endswith("```"):
            raw = raw[:-3]
    return json.loads(raw.strip())


def _get_client() -> genai.Client:
    global _client
    if _client is None:
        if not settings.gemini_api_key:
            raise RuntimeError("GEMINI_API_KEY is not configured")
        _client = genai.Client(api_key=settings.gemini_api_key)
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
    try:
        response = _get_client().models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt,
        )
        return _parse_json(response.text)
    except ClientError as e:
        if e.status_code == 429 or "429" in str(e) or "RESOURCE_EXHAUSTED" in str(e):
            raise HTTPException(
                status_code=429,
                detail="AI rate limit exceeded. Please wait about a minute and try again."
            )
        raise HTTPException(status_code=400, detail=f"AI Client Error: {str(e)}")
    except APIError as e:
        raise HTTPException(status_code=502, detail="Upstream AI provider error. Please try again later.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error during AI extraction: {str(e)}")


def merge_memory_profile(existing_profile: dict, transcript: str) -> dict:
    prompt = (
        "You are an identity-mapping engine. Analyze the conversation and the existing profile JSON.\n"
        "Extract ANY new facts, people, projects, preferences, or recurring topics mentioned.\n"
        "BE PROACTIVE: If the user mentions a friend's name, add it to 'people'. If they mention a hobby, add to 'preferences'.\n"
        "Return the full merged JSON profile with keys: people, projects, preferences, recurring_topics, facts.\n"
        "Ensure the output is valid JSON and contains only the updated profile.\n\n"
        f"Existing Profile:\n{json.dumps(existing_profile)}\n\nNew Conversation:\n{transcript}"
    )
    try:
        response = _get_client().models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt,
        )
        return _parse_json(response.text)
    except ClientError as e:
        if e.status_code == 429 or "429" in str(e) or "RESOURCE_EXHAUSTED" in str(e):
            raise HTTPException(
                status_code=429,
                detail="AI rate limit exceeded. Please wait about a minute and try again."
            )
        raise HTTPException(status_code=400, detail=f"AI Client Error: {str(e)}")
    except APIError as e:
        raise HTTPException(status_code=502, detail="Upstream AI provider error. Please try again later.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error during AI merging: {str(e)}")


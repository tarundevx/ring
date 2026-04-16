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


def process_full_conversation(transcript: str, existing_profile: dict) -> dict[str, Any]:
    from datetime import datetime
    current_time = datetime.now().isoformat()
    prompt = (
        f"Current Time: {current_time}\n"
        "Analyze the following transcript and perform two operations:\n"
        "1. Extraction: Identify any action items (tasks) and reminders mentioned.\n"
        "2. Profile Update: Review the existing user profile and update it with any new facts, people, projects, or preferences from the transcript.\n\n"
        "Return a JSON object with exactly these two keys:\n"
        "- 'extraction': { 'action_items': [...], 'reminders': [...] }\n"
        "  Each action item: { 'title', 'description', 'due_date' (YYYY-MM-DD) }\n"
        "  Each reminder: { 'title', 'body', 'remind_at' (ISO timestamp) }\n"
        "- 'updated_profile': { 'people': [], 'projects': [], 'preferences': [], 'recurring_topics': [], 'facts': [] }\n\n"
        f"Existing Profile:\n{json.dumps(existing_profile)}\n\n"
        f"Transcript:\n{transcript}"
    )
    try:
        response = _get_client().models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt,
        )
        return _parse_json(response.text)
    except ClientError as e:
        code = getattr(e, 'code', None) or getattr(e, 'status_code', None)
        if code == 429 or "429" in str(e) or "RESOURCE_EXHAUSTED" in str(e):
            raise HTTPException(
                status_code=429,
                detail="AI rate limit exceeded. Please wait about a minute and try again."
            )
        raise HTTPException(status_code=400, detail=f"AI Client Error ({code}): {str(e)}")
    except APIError as e:
        raise HTTPException(status_code=502, detail=f"Upstream AI provider error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error during AI processing: {str(e)}")


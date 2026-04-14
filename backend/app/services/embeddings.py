from __future__ import annotations

from google import genai

from app.core.config import settings

_client: genai.Client | None = None


def _get_client() -> genai.Client:
    global _client
    if _client is None:
        if not settings.gemini_api_key:
            raise RuntimeError("GEMINI_API_KEY is not configured")
        _client = genai.Client(api_key=settings.gemini_api_key)
    return _client


def embed_text(text: str) -> list[float]:
    response = _get_client().models.embed_content(
        model="gemini-embedding-001",
        contents=text,
        config={"output_dimensionality": 768}
    )
    return response.embeddings[0].values


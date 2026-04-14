from __future__ import annotations

from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=Path(__file__).resolve().parents[2] / ".env", extra="ignore")

    app_env: str = "development"
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    frontend_origin: str = "http://localhost:3000"

    database_url: str = "sqlite+pysqlite:///./ring.db"
    redis_url: str = "redis://localhost:6379/0"

    qdrant_url: str = "http://localhost:6333"
    qdrant_api_key: str | None = None
    qdrant_conversations_collection: str = "ring_conversations"
    qdrant_user_profiles_collection: str = "ring_user_profiles"

    gemini_api_key: str | None = None
    anthropic_api_key: str | None = None
    supabase_jwt_secret: str | None = None
    vapi_assistant_id: str | None = None


settings = Settings()


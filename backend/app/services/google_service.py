from __future__ import annotations

import uuid
from datetime import datetime, timezone
import json
from typing import Any

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.models import GoogleToken

SCOPES = [
    "https://www.googleapis.com/auth/calendar",
    "https://www.googleapis.com/auth/calendar.events",
    "https://www.googleapis.com/auth/drive.readonly",
    "https://www.googleapis.com/auth/gmail.modify",
]

class GoogleService:
    def __init__(self, db: Session, user_id: uuid.UUID):
        self.db = db
        self.user_id = user_id
        self._credentials = None

    def get_auth_url(self) -> str:
        flow = Flow.from_client_config(
            client_config={
                "web": {
                    "client_id": settings.google_client_id,
                    "client_secret": settings.google_client_secret,
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                }
            },
            scopes=SCOPES,
        )
        flow.redirect_uri = settings.google_redirect_uri
        auth_url, _ = flow.authorization_url(
            access_type="offline",
            include_granted_scopes="true",
            prompt="consent",
        )
        return auth_url

    def handle_callback(self, code: str):
        flow = Flow.from_client_config(
            client_config={
                "web": {
                    "client_id": settings.google_client_id,
                    "client_secret": settings.google_client_secret,
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                }
            },
            scopes=SCOPES,
        )
        flow.redirect_uri = settings.google_redirect_uri
        flow.fetch_token(code=code)
        credentials = flow.credentials

        token_record = self.db.get(GoogleToken, self.user_id)
        if not token_record:
            token_record = GoogleToken(user_id=self.user_id)
            self.db.add(token_record)

        token_record.access_token = credentials.token
        token_record.refresh_token = credentials.refresh_token or token_record.refresh_token
        token_record.token_uri = credentials.token_uri
        token_record.client_id = credentials.client_id
        token_record.client_secret = credentials.client_secret
        token_record.scopes = credentials.scopes
        token_record.expiry = credentials.expiry.replace(tzinfo=timezone.utc)
        
        self.db.commit()

    def get_credentials(self) -> Credentials | None:
        if self._credentials:
            return self._credentials

        token_record = self.db.get(GoogleToken, self.user_id)
        if not token_record:
            return None

        credentials = Credentials(
            token=token_record.access_token,
            refresh_token=token_record.refresh_token,
            token_uri=token_record.token_uri,
            client_id=token_record.client_id,
            client_secret=token_record.client_secret,
            scopes=token_record.scopes,
            expiry=token_record.expiry,
        )

        if credentials.expired and credentials.refresh_token:
            credentials.refresh(Request())
            token_record.access_token = credentials.token
            token_record.expiry = credentials.expiry.replace(tzinfo=timezone.utc)
            self.db.commit()

        self._credentials = credentials
        return credentials

    def get_calendar_service(self):
        creds = self.get_credentials()
        if not creds: return None
        return build("calendar", "v3", credentials=creds)

    def get_drive_service(self):
        creds = self.get_credentials()
        if not creds: return None
        return build("drive", "v3", credentials=creds)

    def get_gmail_service(self):
        creds = self.get_credentials()
        if not creds: return None
        return build("gmail", "v1", credentials=creds)

    def get_status(self) -> dict:
        token = self.db.get(GoogleToken, self.user_id)
        if not token:
            return {"connected": False}
        return {
            "connected": True,
            "enabled_calendar": bool(token.enabled_calendar),
            "enabled_drive": bool(token.enabled_drive),
            "enabled_mail": bool(token.enabled_mail),
        }

    def update_settings(self, settings_update: dict):
        token = self.db.get(GoogleToken, self.user_id)
        if not token: return
        if "enabled_calendar" in settings_update:
            token.enabled_calendar = int(settings_update["enabled_calendar"])
        if "enabled_drive" in settings_update:
            token.enabled_drive = int(settings_update["enabled_drive"])
        if "enabled_mail" in settings_update:
            token.enabled_mail = int(settings_update["enabled_mail"])
        self.db.commit()

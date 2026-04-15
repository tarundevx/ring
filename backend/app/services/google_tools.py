from __future__ import annotations

import datetime
from typing import Any
from sqlalchemy.orm import Session
from app.services.google_service import GoogleService

def get_calendar_tools(db: Session, user_id: Any):
    service = GoogleService(db, user_id)
    cal = service.get_calendar_service()
    if not cal: return {}

    def list_upcoming_events(max_results: int = 10):
        now = datetime.datetime.utcnow().isoformat() + 'Z'
        events_result = cal.events().list(
            calendarId='primary', timeMin=now,
            maxResults=max_results, singleEvents=True,
            orderBy='startTime'
        ).execute()
        return events_result.get('items', [])

    def schedule_event(summary: str, start_time: str, end_time: str, description: str = ""):
        event = {
            'summary': summary,
            'description': description,
            'start': {'dateTime': start_time, 'timeZone': 'UTC'},
            'end': {'dateTime': end_time, 'timeZone': 'UTC'},
        }
        return cal.events().insert(calendarId='primary', body=event).execute()

    return {
        "list_upcoming_events": list_upcoming_events,
        "schedule_event": schedule_event
    }

def get_drive_tools(db: Session, user_id: Any):
    service = GoogleService(db, user_id)
    drive = service.get_drive_service()
    if not drive: return {}

    def search_files(query: str):
        results = drive.files().list(
            q=f"name contains '{query}' or fullText contains '{query}'",
            spaces='drive',
            fields='files(id, name, mimeType)',
        ).execute()
        return results.get('files', [])

    def read_file_content(file_id: str):
        # Simplification: only read text/plain or Google Docs (as text)
        file = drive.files().get(fileId=file_id).execute()
        if file['mimeType'] == 'application/vnd.google-apps.document':
            return drive.files().export(fileId=file_id, mimeType='text/plain').execute().decode('utf-8')
        return "Unsupported file type for reading content."

    return {
        "search_drive_files": search_files,
        "read_drive_file": read_file_content
    }

def get_gmail_tools(db: Session, user_id: Any):
    service = GoogleService(db, user_id)
    gmail = service.get_gmail_service()
    if not gmail: return {}

    def list_recent_emails(max_results: int = 5):
        results = gmail.users().messages().list(userId='me', maxResults=max_results).execute()
        messages = results.get('messages', [])
        details = []
        for msg in messages:
            m = gmail.users().messages().get(userId='me', id=msg['id']).execute()
            details.append({
                "id": m['id'],
                "snippet": m['snippet'],
                "subject": next((h['value'] for h in m['payload']['headers'] if h['name'] == 'Subject'), "No Subject")
            })
        return details

    def draft_email(to: str, subject: str, body: str):
        import base64
        from email.message import EmailMessage
        
        message = EmailMessage()
        message.set_content(body)
        message['To'] = to
        message['From'] = 'me'
        message['Subject'] = subject
        
        encoded_message = base64.urlsafe_b64encode(message.as_bytes()).decode()
        create_message = {'message': {'raw': encoded_message}}
        
        return gmail.users().drafts().create(userId='me', body=create_message).execute()

    return {
        "list_recent_emails": list_recent_emails,
        "draft_email": draft_email
    }

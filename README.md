# Ring

Ring is a voice-first knowledge and workflow agent app with a Next.js frontend and FastAPI backend.

## Monorepo layout

- `backend/` FastAPI + SQLAlchemy + Alembic + Redis/Qdrant integrations
- `frontend/` Next.js 14 App Router + Tailwind + shadcn-style component structure

## Quick start

1. Copy env templates:
   - `backend/.env.example` -> `backend/.env`
   - `frontend/.env.example` -> `frontend/.env.local`
2. Start dependencies (Postgres, Redis, Qdrant) with Docker Compose from `backend/`.
3. Backend:
   - `cd backend`
   - `python -m venv .venv`
   - `.venv\Scripts\activate` (Windows)
   - `pip install -r requirements.txt`
   - `alembic upgrade head`
   - `uvicorn app.main:app --reload --port 8000`
4. Frontend:
   - `cd frontend`
   - `npm install`
   - `npm run dev`

## Architecture highlights

- Voice calls are launched from `RingVoiceButton` using Vapi Web SDK.
- Conversation ingest endpoint stores transcript, creates chunks, writes embeddings to Qdrant, and extracts tasks/reminders via Claude.
- `/api/context/retrieve` performs semantic lookup against Qdrant for call-time context injection.
- Reminder worker polls pending reminders and pushes notifications over WebSocket.


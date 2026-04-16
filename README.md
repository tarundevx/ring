## Ring - Voice-Actuated Workflow Agent

![Next.js](https://img.shields.io/badge/Next.js-App%20Router-black?logo=next.js)![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)![FastAPI](https://img.shields.io/badge/FastAPI-Python-009688?logo=fastapi&logoColor=white)![Qdrant](https://img.shields.io/badge/Qdrant-Vector%20DB-FD1654)![Vapi](https://img.shields.io/badge/Vapi-Voice%20AI-000000)

> A voice-first knowledge and workflow agent focused on capturing context and executing tasks through natural conversation.

## Navigation

- [Why this exists](#why-this-exists)
- [Features](#features)
- [Core Infrastructure: Vapi & Qdrant](#core-infrastructure-vapi--qdrant)
- [Tech stack](#tech-stack)
- [Quickstart](#quickstart)
- [Environment variables](#environment-variables)
- [Notes](#notes)
- [Contributing](#contributing)

## Why this exists

Most note-taking and workflow tools require manual data entry and force context switching. Ring cuts that out: speak naturally, let the system transcribe, embed, extract tasks, and retrieve context automatically. 

## Features

- Voice-first interface via web platform
- Real-time transcription and semantic chunking
- Automated task and reminder extraction
- Call-time semantic context injection
- WebSocket-driven real-time notifications

### Highlights at a glance

| Area | What you get |
| --- | --- |
| **Voice Interface** | Zero-latency browser voice calls via Vapi Web SDK |
| **Memory** | Long-term semantic recall powered by Qdrant |
| **Workflow** | Background task extraction via Anthropic Claude |
| **Real-time** | WebSocket worker polling for immediate notifications |

## Core Infrastructure: Vapi & Qdrant

Ring relies on two specialized pieces of infrastructure to handle voice and memory.

### Vapi (Voice Infrastructure)
- **How we use it:** Vapi handles the entire real-time voice pipeline. Instead of building custom WebRTC connections and streaming audio manually to speech-to-text models, the frontend uses the `RingVoiceButton` to initialize the Vapi Web SDK.
- **Why:** It eliminates audio latency issues, handles turn-taking, and provides clean transcription endpoints that our backend consumes directly.

### Qdrant (Vector Database & Semantic Memory)
- **How vector DB stores a person's details:** When a conversation happens, the backend ingests the transcript, splits it into semantic chunks, and converts those chunks into high-dimensional vector embeddings. These vectors are inserted into Qdrant alongside strict payload metadata (e.g., `user_id`, `call_id`, `timestamp`). 
- **Why:** Standard relational databases fail at context recall. If a user says, "What was that marketing timeline we discussed?", a keyword search might fail. Qdrant performs a nearest-neighbor semantic search to find conceptually similar conversation chunks, regardless of the exact words used.
- **How it works in practice:** During a live voice call, the `/api/context/retrieve` endpoint takes the user's current speech, embeds it, and queries Qdrant filtering by the current `user_id`. The retrieved historical context is instantly injected back into the LLM's prompt, giving the agent perfect memory of past conversations.

## Tech stack

- **Frontend:** Next.js 14 App Router, React, TypeScript, Tailwind, shadcn/ui
- **Backend:** FastAPI, PostgreSQL (SQLAlchemy + Alembic)
- **Infrastructure:** Qdrant (Vector database), Redis (Workers/Caching)
- **AI & Voice:** Vapi Web SDK, GROQ LLM


## Quickstart

### Requirements

- Node.js 18+
- Python 3.10+

### 1) Infrastructure

Start the background dependencies from the backend directory:

```bash
cd backend
docker-compose up -d
```
This spins up PostgreSQL, Redis, and Qdrant locally.

### 2) Backend Setup

In the `backend/` directory:

```bash
python -m venv .venv
```

Activate virtual env:

- **Windows PowerShell / CMD**
  ```powershell
  .\.venv\Scripts\activate
  ```
- **macOS/Linux**
  ```bash
  source .venv/bin/activate
  ```

Install, migrate, and run:

```bash
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Backend API: [http://127.0.0.1:8000](http://127.0.0.1:8000)

### 3) Frontend Setup

In a new terminal, from the `frontend/` directory:

```bash
npm install
npm run dev
```

App: [http://localhost:3000](http://localhost:3000)

## Environment variables

### Frontend (`frontend/.env.local`)

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_VAPI_PUBLIC_KEY` | Yes | Vapi Web SDK initialization |
| `NEXT_PUBLIC_BACKEND_URL` | No | Fallback to `http://127.0.0.1:8000` |

### Backend (`backend/.env`)

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `REDIS_URL` | Yes | Redis connection string for workers |
| `QDRANT_URL` | Yes | Qdrant host (usually `http://localhost:6333`) |
| `GROQ_API_KEY` | Yes | GROQ API key for task extraction |
| `VAPI_SECRET_KEY` | Yes | Server-side Vapi webhooks/authentication |


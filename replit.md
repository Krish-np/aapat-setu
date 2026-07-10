# Aapat Setu — AI Emergency Coordination Platform

Built for HackFusion 2026. Unifies citizens, volunteers, responders, and agencies into a real-time AI-powered emergency network.

## How to run

The **"Start application"** workflow handles everything:
1. Builds the React/Vite frontend → `backend/static/`
2. Starts FastAPI on **port 5000**

```
bash start.sh
```

## Stack

| Layer     | Tech |
|-----------|------|
| Frontend  | React 19 + Vite, React Router, Leaflet maps, Zustand, Recharts, Tailwind CSS |
| Backend   | FastAPI, SQLAlchemy, SQLite (default), JWT auth |
| Real-time | FastAPI WebSockets |
| AI layer  | Offline heuristic NLP (no API key needed); plug-in point for OpenAI/Anthropic |

## Project layout

```
├── backend/          FastAPI app
│   ├── app/          Source (main.py, models, routers, ai.py, seed.py)
│   ├── static/       Built frontend (generated — do not edit)
│   └── aapatsetu.db  SQLite database (auto-created on first run)
├── frontend/         React/Vite source
├── frontend-2/       Alternate/WIP frontend variant (not used in build)
├── start.sh          Replit launcher (build + serve)
└── uploads/          Feature spec docs
```

## Demo logins (password: `demo1234`)

| Role       | Phone       |
|------------|-------------|
| Citizen    | 9800000001  |
| Volunteer  | 9800000002  |
| Responder  | 9800000004  |
| Hospital   | 9800000010  |
| Fire       | 9800000012  |

## Environment / Secrets

- **`SESSION_SECRET`** — Replit secret, used as the JWT signing key automatically.
- **`APP_DATABASE_URL`** — Override to use MySQL/Postgres (default: SQLite).
- **`OPENAI_API_KEY`** / **`ANTHROPIC_API_KEY`** — Optional; enables real LLM in `backend/app/ai.py`.

## Notes

- The `DATABASE_URL` env var is intentionally ignored (Replit injects a Postgres URL there). Use `APP_DATABASE_URL` to change databases.
- `frontend-2/` is a refactor-in-progress with `*0.jsx` backup files; `frontend/` is the active build source.
- The seed script (`backend/app/seed.py`) auto-populates demo users and Kathmandu sample incidents on first startup.

## User preferences

<!-- Add any user preferences here -->

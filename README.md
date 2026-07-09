# 🚨 Aapat Setu — AI-Powered Emergency Coordination Platform

> **"Aapat Setu"** (lit. *Emergency Bridge*) unifies citizens, volunteers, responders, and agencies into a single real-time coordination network — built in 24 hours for **HackFusion 2026**.

## ✨ The Problem
Emergency information is scattered across different agencies (police, fire, ambulance, NGOs, volunteers), delaying response efforts during the critical "golden hour."

## 💡 The Solution
A citizen reports an emergency. Within seconds, AI:
1. ✅ **Verifies** the report is plausible (filters spam/vague/nonsensical)
2. 📝 **Summarizes** it into a clean one-liner for responders
3. ⚡ **Assigns priority** (critical/high/medium/low)
4. 🔁 **Detects duplicates** by location + semantic similarity
5. 🎯 **Pushes it live** to nearest responder & volunteer dashboards — *before a human has to lift a finger to triage it*

## 🧑‍🤝‍🧑 User Roles
| Role | Capabilities |
|------|--------------|
| 👤 **Citizen** | Report emergencies with map pin + geolocation; track live status; view public alerts and nearby incidents |
| 🤝 **Volunteer** | See open tasks near them on a live map; claim tasks; update progress with notes; mark complete |
| 🎯 **Responder / Agency** | Command center dashboard; verify reports; change status; broadcast public alerts; analytics |

## 🏗️ Tech Stack
- **Frontend:** React 19 + Vite, React Router, Leaflet (react-leaflet) maps, Zustand state, Recharts analytics, Axios
- **Backend:** FastAPI, SQLAlchemy + SQLite (swappable to Postgres), JWT auth (python-jose + passlib/bcrypt)
- **Real-time:** Native FastAPI WebSockets for live map/dashboard updates
- **AI Layer:** Deterministic heuristic NLP engine (works fully offline for demos) with plug-in point for OpenAI/Anthropic
- **Deployment:** Single-port production mode (FastAPI serves built SPA) or split dev mode (Vite HMR :5173, API :8000)

## 📁 Project Structure
```
aapatsetu/
├── backend/
│   ├── app/
│   │   ├── main.py           # FastAPI app + WebSocket + SPA static hosting
│   │   ├── config.py         # Settings
│   │   ├── database.py       # SQLAlchemy engine/session
│   │   ├── models.py         # User, Incident, Task, StatusHistory, Alert
│   │   ├── schemas.py        # Pydantic models
│   │   ├── security.py       # JWT + bcrypt + role guards
│   │   ├── ai.py             # AI pipeline: verify/summarize/priority/duplicate
│   │   ├── ws_manager.py     # WebSocket broadcast manager
│   │   ├── seed.py           # Demo users + sample Kathmandu incidents
│   │   └── routers/
│   │       ├── auth.py
│   │       ├── incidents.py
│   │       ├── tasks.py
│   │       └── alerts.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx           # Routing + WS live updates
│   │   ├── main.jsx
│   │   ├── styles.css        # Dark emergency-theme design system
│   │   ├── components/
│   │   │   ├── Layout.jsx
│   │   │   ├── IncidentMap.jsx
│   │   │   └── ...
│   │   ├── pages/
│   │   │   ├── Auth.jsx
│   │   │   ├── ResponderDashboard.jsx  (Command Center)
│   │   │   ├── VolunteerDashboard.jsx
│   │   │   ├── CitizenDashboard.jsx
│   │   │   ├── ReportIncident.jsx      (3-step wizard with map picker)
│   │   │   ├── IncidentDetail.jsx      (timeline + role actions)
│   │   │   ├── MapPage.jsx
│   │   │   ├── MyReports.jsx
│   │   │   ├── MyTasks.jsx
│   │   │   ├── Alerts.jsx
│   │   │   └── Analytics.jsx
│   │   ├── store/auth.js
│   │   └── lib/{api.js, helpers.js, toast.jsx}
│   ├── index.html
│   └── vite.config.js
├── run.sh          # Single-port production run
└── run_dev.sh      # Dev mode (Vite HMR + FastAPI reload)
```

## 🚀 Quick Start

### One-command demo (simplest)
```bash
./run.sh
# Then open http://localhost:8000
```

### Development mode (hot reload)
```bash
./run_dev.sh
# Frontend: http://localhost:5173   (with Vite HMR)
# Backend:  http://localhost:8000  (with uvicorn --reload)
# API docs: http://localhost:8000/docs
```

## 🔑 Demo Accounts (password: `demo1234`)
| Phone | Role | Name |
|-------|------|------|
| `9800000004` | 🎯 Responder | Sita Responder |
| `9800000005` | 🎯 Responder | Disaster Control |
| `9800000002` | 🤝 Volunteer | Aasha Volunteer |
| `9800000003` | 🤝 Volunteer | Bibek Volunteer |
| `9800000001` | 👤 Citizen | Citizen Demo |

Or register a new account directly from the login screen (pick your role).

## 🎬 Demo Script (3-minute judge flow)

1. **Open the app** as **Responder** (`9800000004`) — command center shows live stats, a dark-tiled map with color-coded pins (red=critical pulses, amber=high, blue=medium, green=low), and incoming reports. Note the 7 pre-seeded Kathmandu incidents.

2. **Switch to an incognito window** → log in as **Citizen** (`9800000001`) → click **🚨 Report Emergency**.

3. Step 1: Choose "flood," paste: *"Water is flooding the streets, people are trapped on roofs, children stuck, water rising fast, need boats immediately!"* AI will decide priority. Click Next.

4. Step 2: Pin location on map (or use geolocation). Click **Submit**.

5. The **"Done"** screen appears instantly showing:
   - 🤖 AI Summary
   - ⚡ Priority: **CRITICAL**
   - ✓ Verified by AI
   - 🔁 Duplicate check passed

6. **Without refreshing** the responder tab: a toast slides in (`🚨 New flood reported · critical priority`) and the incident appears live on the map and in the list. **That's the WebSocket real-time push.**

7. As responder: click **Verify** → incident moves to Verified.

8. **Switch to another window / role → Volunteer** (`9800000002`) → the new task appears on the map and in "Tasks to Claim" with distance from the volunteer. Click **✋ Claim Task** → incident status moves to "Assigned."

9. Click **"On Scene / In Progress"** → **"✓ Mark Complete"** with notes. Status flows to **Resolved**.

10. Switch back to the **Citizen's view** → open "My Reports" → click the report → status timeline shows the full chain: Reported → Verified → Assigned → In Progress → Resolved. **Citizen got live updates the whole time.**

11. Bonus: As responder, visit **📢 Send Alerts** to broadcast, and **📊 Analytics** for the Recharts breakdown.

## 🧠 AI Layer Details

All four AI features live in `backend/app/ai.py`:

- **`verify_report()`** — length checks, spam pattern regex (repeated chars, "test"/"asdf"/external links), plausibility scoring
- **`summarize()`** — intelligent first-sentence extraction with type prefix (`[Flood] Water is flooding the streets...`) capped at 160 chars
- **`assign_priority()`** — keyword dictionary (CRITICAL/HIGH/MEDIUM keywords), base severity by incident type (building collapse → starts at critical; fire/gas/earthquake → high; etc.), weighted score
- **`detect_duplicate()`** — combines haversine distance (≤500m threshold) and Jaccard token overlap over the last 24h of open incidents

The engine is fully deterministic and works 100% offline so the demo never fails due to network/API issues. To swap in a real LLM, add `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` to `.env` and replace the functions with API calls (architecture already supports this).

## ✅ Feature Status

**Must-Have (MVP) — all complete:**
- [x] 1. Incident Reporting with type/description/severity/location (map pin + geolocation)
- [x] 2. Status Pipeline: Reported → Verified → Assigned → In Progress → Resolved
- [x] 3. Live shared map with color-coded priority pins (Leaflet dark tiles)
- [x] 4. Incident detail view with full status history timeline
- [x] 5. Role-based JWT auth (citizen/volunteer/responder logins + register)
- [x] 6. Agency command center dashboard: table + map, verify/assign/resolve
- [x] 7. Volunteer dashboard: nearby tasks with distance, claim flow
- [x] 8. Task status updates with notes (append-style audit log)
- [x] 9. Citizen "My Reports" tracking page
- [x] 10. Public Alerts view for citizens

**AI Layer — all complete:**
- [x] 11. AI report verification (spam/vague/nonsensical detection)
- [x] 12. AI summarization (one-liner with type prefix)
- [x] 13. AI priority assignment (critical/high/medium/low)
- [x] 14. Duplicate detection (location + token similarity)

**High-Impact extras implemented:**
- [x] 15. Real-time updates via WebSockets (live map + toasts, no refresh)
- [x] 18. Broadcast Alerts (agency → all users, pushed via WS)
- [x] 20. Analytics Dashboard (Recharts: bar/pie charts by type/priority/status)

## 🗺️ Design Notes
- **Dark, professional emergency-ops theme** — red accents (#ef4444), high contrast, glow/pulse animations for critical markers
- **3-step report wizard** with stepper UI, map pin picker, "use my location" button
- **Color-coded status badges & priority dots** that are consistent across map/table/cards
- **Pulsing CSS markers** on the map for visual urgency
- **Responsive layout** (sidebar collapses on small screens)
- **Role-based home pages** — each role lands on a dashboard optimized for them

## 📜 License
Built for HackFusion 2026 demo.

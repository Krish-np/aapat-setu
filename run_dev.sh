#!/bin/bash
# Run Aapat Setu for development: starts backend (FastAPI) and frontend (Vite HMR)
set -e
cd "$(dirname "$0")"

echo "==============================================="
echo "    Aapat Setu - Emergency Coordination"
echo "==============================================="
echo ""

# Start backend in background
echo "[1/2] Starting FastAPI backend on http://localhost:8000 ..."
(
  cd backend
  pip install -q -r requirements.txt 2>/dev/null
  uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
) &
BACK_PID=$!

# Start frontend in background
echo "[2/2] Starting Vite dev server on http://localhost:5173 ..."
(
  cd frontend
  npm install --silent 2>/dev/null
  npm run dev
) &
FRONT_PID=$!

trap "echo ''; echo 'Shutting down...'; kill $BACK_PID $FRONT_PID 2>/dev/null; exit" INT TERM
echo ""
echo ">>> Open http://localhost:5173 for the app"
echo ">>> API docs at http://localhost:8000/docs"
echo ""
echo "Demo logins (any phone below / password: demo1234):"
echo "   Responder:  9800000004  (Sita Responder)"
echo "   Volunteer:  9800000002  (Aasha Volunteer)"
echo "   Citizen:    9800000001  (Citizen Demo)"
echo ""
wait

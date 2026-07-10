#!/bin/bash
# Aapat Setu — Replit launcher
set -eo pipefail
cd "$(dirname "$0")"

echo "[1/2] Building frontend..."
chmod -R +x frontend/node_modules/.bin/ 2>/dev/null || true
cd frontend
npm run build
if [ ! -f ../backend/static/index.html ]; then
  echo "ERROR: Frontend build did not produce backend/static/index.html — aborting."
  exit 1
fi
cd ..

echo "[2/2] Starting server on port 5000..."
echo ""
echo "  Demo logins (password: demo1234)"
echo "     Responder  : 9800000004"
echo "     Volunteer  : 9800000002"
echo "     Citizen    : 9800000001"
echo ""
cd backend
exec python3 -m uvicorn app.main:app --host 0.0.0.0 --port 5000

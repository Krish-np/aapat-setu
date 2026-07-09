#!/bin/bash
# Production-style single-server run: builds frontend into backend/static, serves both via FastAPI on :8000
set -e
cd "$(dirname "$0")"

echo "Building frontend..."
( cd frontend && npm install --silent && npm run build )

echo "Installing backend deps..."
( cd backend && pip install -q -r requirements.txt )

echo "Starting Aapat Setu on http://0.0.0.0:8000 ..."
cd backend
rm -f aapatsetu.db
exec uvicorn app.main:app --host 0.0.0.0 --port 8000

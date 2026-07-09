@echo off
REM ==============================================================
REM  Aapat Setu v2 — Windows DEV mode (hot reload)
REM  Runs Vite dev server on :5173 + uvicorn on :8000 with reload
REM  Requires TWO terminal windows (this script opens both).
REM ==============================================================
setlocal
cd /d "%~dp0"

echo Starting backend (uvicorn with reload) on http://localhost:8000
echo Starting frontend (Vite HMR) on http://localhost:5173
echo.

REM Install deps if needed
python -m pip install -q -r backend\requirements.txt
python -m pip install -q "bcrypt<4.1" pymysql cryptography
cd frontend
call npm install --silent 2>nul
cd ..

set DATABASE_URL=mysql+pymysql://root:YOUR_PASSWORD@localhost:3306/aapatsetudb?charset=utf8mb4

start "AapatSetu Backend" cmd /k "cd backend && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"
start "AapatSetu Frontend" cmd /k "cd frontend && npm run dev"

echo Both windows opened. Open http://localhost:5173
pause

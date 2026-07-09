#!/bin/bash
# ==============================================================
#  Aapat Setu v2 — one-command launcher (MySQL/XAMPP default)
# ==============================================================
set -e
cd "$(dirname "$0")"

# ---------- Dependencies ----------
echo "[1/4] Installing backend dependencies..."
pip3 install -q -r backend/requirements.txt 2>/dev/null
pip3 install -q 'bcrypt<4.1' pymysql cryptography 2>/dev/null

echo "[2/4] Building frontend with Tailwind..."
( cd frontend && npm install --silent 2>/dev/null && npm run build 2>&1 | tail -2 )

# ---------- MySQL Default ----------
if [ -f backend/.env ]; then set -a; . backend/.env; set +a; fi
export DATABASE_URL="${DATABASE_URL:-mysql+pymysql://root:@localhost:3306/aapatsetudb?charset=utf8mb4}"
echo "[3/4] Database: $DATABASE_URL"

echo "[4/4] Starting server..."
echo ""
echo "  🏠 Public website:   http://localhost:8000/"
echo "  🚨 App dashboard:    http://localhost:8000/app"
echo "  📘 API docs:         http://localhost:8000/docs"
echo "  🗄️  phpMyAdmin:       http://localhost/phpmyadmin"
echo ""
echo "  Demo logins (password: demo1234)"
echo "     Responder  : 9800000004"
echo "     Volunteer  : 9800000002"
echo "     Citizen    : 9800000001"
echo "     Hospital   : 9800000010"
echo "     Fire       : 9800000012"
echo ""
cd backend
exec python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000

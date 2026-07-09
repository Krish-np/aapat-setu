#!/bin/bash
# ==============================================================
#  Aapat Setu — single-command launcher (MySQL / XAMPP mode)
# ==============================================================
#  Prerequisites:
#    1. Start XAMPP → Apache + MySQL running
#    2. Create database `aapatsetu` in phpMyAdmin (app auto-creates it too)
#    3. Default MySQL creds: root / (empty) — edit backend/.env to change
#
#  This script will:
#    - Install Python + Node deps
#    - Build the React frontend into backend/static
#    - Start FastAPI on http://localhost:8000
# ==============================================================
set -e
cd "$(dirname "$0")"

echo ""
echo "=============================================="
echo "   🚨 Aapat Setu — Emergency Coordination"
echo "=============================================="
echo ""

# ---------- Python deps ----------
echo "[1/4] Installing backend dependencies..."
pip3 install -q -r backend/requirements.txt 2>/dev/null
pip3 install -q 'bcrypt<4.1' 2>/dev/null

# ---------- Node deps + build ----------
echo "[2/4] Building frontend..."
( cd frontend && npm install --silent 2>/dev/null && npm run build )

# ---------- Load env ----------
if [ -f backend/.env ]; then
  set -a; . backend/.env; set +a
fi
export DATABASE_URL="${DATABASE_URL:-mysql+pymysql://root:@localhost:3306/aapatsetu?charset=utf8mb4}"

echo "[3/4] Database: $DATABASE_URL"
echo "[4/4] Starting server..."
echo ""
echo "  🌐 Public website:  http://localhost:8000/"
echo "  🚨 App dashboard:   http://localhost:8000/app"
echo "  📘 API docs:        http://localhost:8000/docs"
echo "  🗄️  phpMyAdmin:      http://localhost/phpmyadmin"
echo ""
echo "  Demo logins (password: demo1234)"
echo "     Responder : 9800000004"
echo "     Volunteer : 9800000002"
echo "     Citizen   : 9800000001"
echo ""

cd backend
exec python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000

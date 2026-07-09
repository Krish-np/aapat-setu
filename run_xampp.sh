#!/bin/bash
# Run Aapat Setu backed by XAMPP's MySQL database
set -e
cd "$(dirname "$0")/backend"

# Load XAMPP .env if it exists
if [ -f .env.xampp ]; then
  set -a; . .env.xampp; set +a
else
  export DATABASE_URL="${DATABASE_URL:-mysql+pymysql://root:@localhost:3306/aapatsetudb?charset=utf8mb4}"
fi

echo "============================================================"
echo "   Aapat Setu — XAMPP MySQL mode"
echo "============================================================"
echo "  DB:        $DATABASE_URL"
echo "  API:       http://localhost:8000"
echo "  App:       http://localhost:8000  (after running build_frontend.sh)"
echo "  phpMyAdmin: http://localhost/phpmyadmin"
echo "============================================================"

# Ensure python deps are installed
pip install -q -r requirements.txt 2>/dev/null
pip install -q pymysql cryptography 2>/dev/null
pip install -q 'bcrypt<4.1' 2>/dev/null

# Make sure static frontend is built
if [ ! -d "static/index.html" ]; then
  echo ""
  echo "[i] Frontend not built yet. Building it now..."
  ( cd ../frontend && npm install --silent 2>/dev/null && npm run build )
fi

exec python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000

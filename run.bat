@echo off
REM ==============================================================
REM  Aapat Setu v2 — Windows launcher (XAMPP MySQL default)
REM  Run this from the extracted aapatsetu\ folder
REM ==============================================================
setlocal
cd /d "%~dp0"

echo ================================================================
echo   Aapat Setu - Emergency Coordination Platform (Windows)
echo ================================================================
echo.

REM ---------- Check prerequisites ----------
where python >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python not found. Install Python 3.10+ from https://www.python.org/downloads/
    echo         Make sure to check "Add Python to PATH" during install.
    pause
    exit /b 1
)

where npm >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js / npm not found. Install from https://nodejs.org/ (LTS version).
    pause
    exit /b 1
)

echo [i] Using Python:
python --version
echo [i] Using Node:
call node --version
echo.

REM ---------- Install backend deps ----------
echo [1/4] Installing backend dependencies...
python -m pip install -q -r backend\requirements.txt
python -m pip install -q "bcrypt<4.1" pymysql cryptography
if errorlevel 1 (
    echo [ERROR] pip install failed. Try running: python -m pip install --upgrade pip
    pause
    exit /b 1
)

REM ---------- Build frontend ----------
echo [2/4] Building frontend (first run takes a minute)...
cd frontend
call npm install
if errorlevel 1 (
    echo [ERROR] npm install failed. Check your internet connection.
    cd ..
    pause
    exit /b 1
)
call npm run build
if errorlevel 1 (
    echo [ERROR] Frontend build failed.
    cd ..
    pause
    exit /b 1
)
cd ..

REM ---------- Database ----------
set DATABASE_URL=mysql+pymysql://root:YOUR_PASSWORD@localhost:3306/aapatsetudb?charset=utf8mb4
if exist backend\.env (
    for /f "usebackq tokens=1,* delims==" %%A in ("backend\.env") do (
        if "%%A"=="DATABASE_URL" set DATABASE_URL=%%B
    )
)
echo [3/4] Database: %DATABASE_URL%
echo [i] Make sure XAMPP MySQL is RUNNING (green in XAMPP Control Panel)
echo.

REM ---------- Start server ----------
echo [4/4] Starting server...
echo.
echo   =======================================================
echo     Public website :  http://localhost:8000/
echo     App dashboard  :  http://localhost:8000/app
echo     API docs       :  http://localhost:8000/docs
echo     phpMyAdmin     :  http://localhost/phpmyadmin
echo   =======================================================
echo.
echo   Demo logins (password: demo1234)
echo      Citizen    9800000001
echo      Volunteer  9800000002
echo      Responder  9800000004
echo      Admin      9800000005
echo.
echo   Press Ctrl+C to stop the server.
echo.

cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
cd ..
pause

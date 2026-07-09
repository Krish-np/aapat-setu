# 🚨 Aapat Setu — Troubleshooting Guide

If `./run.sh` (Mac/Linux) or `run.bat` (Windows) fails, read this.

---

## ✅ First, make sure these 3 things are installed

You need ALL THREE installed before running:

| Required | How to check install | Download |
|---|---|---|
| **Python 3.10+** | Open terminal → `python --version` (Windows) or `python3 --version` (Mac/Linux) | https://www.python.org/downloads/ — ⚠️ on Windows CHECK "Add Python to PATH" during install |
| **Node.js 18+** (includes npm) | `node --version` and `npm --version` | https://nodejs.org/ — pick the **LTS** version |
| **XAMPP** (with MySQL started) | Open XAMPP Control Panel → click **Start** next to **MySQL** (Apache is optional but useful for phpMyAdmin) | https://www.apachefriends.org/ |

---

## 🪟 WINDOWS USERS — DO NOT use plain Command Prompt for `run.sh`

**Option A (EASIEST):**  Double-click **`run.bat`** — it's the Windows-native launcher.

**Option B:**  Use Git Bash (installed with Git for Windows: https://git-scm.com/download/win) or WSL, then:
```bash
cd /c/path/to/aapatsetu
./run.sh
```

If you try `./run.sh` in **PowerShell** or plain **cmd.exe**, you'll get:
> `'.' is not recognized...` or `bash: command not found`
Use `run.bat` instead.

---

## ❌ Common Errors & Fixes

### 1. `python3: command not found` (Mac/Linux) or `'python' is not recognized` (Windows)
Python isn't installed or isn't on PATH.
- Windows: Reinstall Python from python.org, CHECK "Add Python to PATH".
- Mac: `brew install python` or use https://www.python.org
- Linux (Ubuntu/Debian): `sudo apt install python3 python3-pip python3-venv`

### 2. `npm: command not found` / `node: command not found`
Node.js isn't installed. Download LTS from https://nodejs.org and install.

### 3. `Can't connect to MySQL server` / `Connection refused`
XAMPP MySQL is not running.
- Open XAMPP Control Panel → click **Start** next to **MySQL**. Wait until it turns green.
- If MySQL won't start, another program (Skype, another MySQL, Workbench) may be using port 3306.
- Test: visit http://localhost/phpmyadmin — if it loads, MySQL is running.

### 4. `Access denied for user 'root'@'localhost'`
Your XAMPP `root` user has a password (non-default). Edit `backend/.env` with Notepad/VS Code:
```
DATABASE_URL=mysql+pymysql://root:YOUR_PASSWORD@localhost:3306/aapatsetu?charset=utf8mb4
```
Replace `YOUR_PASSWORD` with your actual MySQL root password. If you have no password (most XAMPP installs), the default line works as-is.

### 5. `ModuleNotFoundError: No module named 'xyz'`
Pip install didn't complete. Run manually:
```bash
cd backend
pip install -r requirements.txt
pip install "bcrypt<4.1" pymysql cryptography
```
(On Windows use `python -m pip install ...`)

### 6. `bcrypt` error / `AttributeError: module 'bcrypt' has no attribute '__about__'`
Version conflict. Fix with:
```bash
pip uninstall -y bcrypt passlib
pip install "bcrypt<4.1" "passlib[bcrypt]"
```

### 7. `Error: [Errno 98] Address already in use` / `Port 8000 is already in use`
Another program (or a previous run) is using port 8000.
- Mac/Linux: `fuser -k 8000/tcp` or `lsof -ti:8000 | xargs kill -9`
- Windows (Admin Command Prompt): `netstat -ano | findstr :8000` then `taskkill /PID <number> /F`
- Or change the port at the very end of `run.sh` / `run.bat` (change `8000` to `8080`).

### 8. `npm install` fails with network errors
Try:
```bash
cd frontend
npm cache clean --force
npm install
```

### 9. The server starts but page is blank or shows a white screen
- The Vite build may have failed. Look for red errors in the terminal during step [2/4].
- Try manually: `cd frontend && npm install && npm run build` — you should see `dist/` (it outputs to `../backend/static/` here).
- Hard-refresh your browser: Ctrl+Shift+R.

### 10. The website opens but login fails / "Network Error"
- Make sure you're visiting http://localhost:8000 (NOT a file:// URL, and NOT port 5500/3000/5173).
- The backend serves both API AND frontend on the same port 8000.

---

## 🔄 Resetting the database
If you want a clean start (e.g. after a schema change):
1. Open http://localhost/phpmyadmin
2. Click `aapatsetu` on the left
3. Click "Drop" (or "Delete") at the top
4. Restart the server (`run.bat` / `./run.sh`)
The tables + demo data will be recreated automatically.

---

## 📞 Still stuck?
Copy-paste the **full error message** from your terminal and share:
1. Which OS you're using (Windows/Mac/Linux)
2. Which command you ran
3. The full red error text

Then I can give you the exact fix.

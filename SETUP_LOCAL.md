# 🚀 Running Aapat Setu locally with XAMPP + your own JWT

## Step 1 — Start XAMPP MySQL
Open the XAMPP Control Panel and click **Start** next to **MySQL** (Apache is optional).

## Step 2 — Create the database (optional — the app auto-creates it)
Visit http://localhost/phpmyadmin → New → name: **`aapatsetudb`** → Collation: `utf8mb4_unicode_ci` → Create.

You can also skip this step; the app runs `CREATE DATABASE IF NOT EXISTS aapatsetudb` on startup.

## Step 3 — Configure your credentials + JWT secret
Open **`backend/.env`** in Notepad/VS Code. It now looks like this:

```
DATABASE_URL=mysql+pymysql://root:@localhost:3306/aapatsetudb?charset=utf8mb4
SECRET_KEY=aapatsetudb-jwt-secret-change-this-to-your-own-random-string
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

- If your MySQL `root` has a password, put it between `:` and `@`, e.g.
  `mysql+pymysql://root:MYPASSWORD@localhost:3306/aapatsetudb?charset=utf8mb4`
- **Change `SECRET_KEY`** to your own long random string. Generate one:
  ```
  python -c "import secrets; print(secrets.token_hex(32))"
  ```
  Paste the output after `SECRET_KEY=`.
- `ACCESS_TOKEN_EXPIRE_MINUTES=1440` = 24 hours. Change to `60` for 1-hour tokens, `10080` for 7 days, etc.

## Step 4 — Install prerequisites
| What | Install | Verify |
|---|---|---|
| Python 3.10+ | https://www.python.org/downloads/ (Windows: ✅ tick "Add Python to PATH") | `python --version` |
| Node.js LTS | https://nodejs.org/ | `node --version` and `npm --version` |
| XAMPP | https://www.apachefriends.org/ | MySQL running (green) |

## Step 5 — Run it

### 🪟 Windows
Double-click **`run.bat`** (in the extracted folder). Or open Command Prompt:
```cmd
cd path\to\aapatsetu
run.bat
```

### 🍎 Mac / 🐧 Linux
Open Terminal:
```bash
cd path/to/aapatsetu
chmod +x run.sh
./run.sh
```

The script will:
1. Install Python dependencies (`pip install -r backend/requirements.txt` + `pymysql` + `bcrypt<4.1`)
2. Install npm packages and build the frontend with Tailwind
3. Auto-create the `aapatsetudb` database + tables (if they don't exist)
4. Seed demo users/data **only if the `users` table is empty** (it won't touch any data you add later)
5. Start uvicorn on http://localhost:8000

## Step 6 — Open the app
Wait until you see:
```
Uvicorn running on http://0.0.0.0:8000
```
Then visit:
- 🏠 **http://localhost:8000/** — Public landing page
- 🚨 **http://localhost:8000/app** — App login/dashboard
- 📘 **http://localhost:8000/docs** — FastAPI Swagger docs
- 🗄️ **http://localhost/phpmyadmin** — To see your `aapatsetudb` database

## Step 7 — Log in with demo accounts
All demo accounts use password **`demo1234`**:

| Phone | Role |
|---|---|
| 9800000001 | 👤 Citizen |
| 9800000002 | 🤝 Volunteer |
| 9800000003 | 🤝 Volunteer |
| 9800000004 | 🎯 Responder |
| 9800000005 | ⚙️ Super Admin |
| 9800000010 | 🏥 Hospital |
| 9800000011 | 🚓 Police |
| 9800000012 | 🚒 Fire |
| 9800000013 | ❤️ NGO |
| 9800000014 | 🏛️ Municipality |

You can also register new accounts via the "Register" tab on the login page.

---

## 🔐 About the JWT Auth (how it works)
- Tokens are signed with HS256 using your `SECRET_KEY` from `.env`.
- Token payload: `{sub: "<user_id>", exp: <expiry timestamp>}`
- Token is returned as `access_token` from `POST /api/auth/login` and `POST /api/auth/register`.
- Send it on subsequent requests as header: `Authorization: Bearer <token>`.
- Tokens expire after `ACCESS_TOKEN_EXPIRE_MINUTES` minutes (default 1440 = 24h).
- The frontend stores the token in localStorage and auto-attaches it via an Axios interceptor.

### To use your own JWT logic (if you want to extend it):
- Signing/verification lives in **`backend/app/security.py`** (`create_access_token`, `verify_token`, `get_current_user`).
- The auth router is **`backend/app/routers/auth.py`** (login + register + /me).
- Role-based route guards use `Depends(require_roles("admin","responder"))` (imported from `security.py`).

---

## 🔄 Resetting the database
If you want a clean start:
1. Open http://localhost/phpmyadmin
2. Select `aapatsetudb` on the left
3. Click **Drop** (or "Check all" → "Drop")
4. Restart `run.bat` / `./run.sh`

The tables + demo data are recreated automatically.

---

## ❓ Troubleshooting
See **`TROUBLESHOOTING.md`** (in this folder) for common errors:
- `'python' is not recognized` → reinstall Python with "Add to PATH"
- `'npm' is not recognized` → install Node.js LTS
- `Can't connect to MySQL` → start MySQL in XAMPP
- `Access denied for root` → edit `.env` with your MySQL password
- `ModuleNotFoundError` → `cd backend` then `pip install -r requirements.txt`
- `Port 8000 in use` → close the old terminal / change port in run.bat

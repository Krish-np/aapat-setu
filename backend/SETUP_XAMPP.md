# 🗄️ XAMPP + MySQL Setup for Aapat Setu v2

## 1. Start XAMPP
- Open XAMPP Control Panel → Start **Apache** (for phpMyAdmin) and **MySQL**.

## 2. Create Database
- Visit http://localhost/phpmyadmin → New → name: `aapatsetudb` → Create (utf8mb4).
- You don't even need to do this — the app auto-creates the DB on first start.

## 3. Credentials
Default XAMPP MySQL: user `root`, empty password. If yours has a password, edit `backend/.env`:
```
DATABASE_URL=mysql+pymysql://root:YOUR_PASSWORD@localhost:3306/aapatsetudb?charset=utf8mb4
```

## 4. Run
```bash
./run.sh
```
Wait for "Uvicorn running on http://0.0.0.0:8000" then open:
- http://localhost:8000/  (Public website)
- http://localhost:8000/app (The platform)
- http://localhost:8000/docs (API docs)

## 5. Demo logins (password: `demo1234`)
| Phone | Role |
|---|---|
| 9800000001 | 👤 Citizen |
| 9800000002 | 🤝 Volunteer |
| 9800000004 | 🎯 Responder |
| 9800000010 | 🏥 Hospital |
| 9800000011 | 🚓 Police |
| 9800000012 | 🚒 Fire |
| 9800000013 | ❤️ NGO |
| 9800000014 | 🏛️ Municipality |
| 9800000005 | ⚙️ Super Admin |

## 6. Reset database
Drop the `aapatsetudb` schema in phpMyAdmin → restart `./run.sh`. Tables + demo data are recreated automatically.

# 🗄️ Setting up with XAMPP (MySQL)

## 1. Start XAMPP
Open the XAMPP Control Panel and start:
- ✅ **Apache** (for phpMyAdmin on http://localhost/phpmyadmin)
- ✅ **MySQL** (database server on port 3306)

## 2. Create the database
- Open http://localhost/phpmyadmin
- Click **New** on the left
- Name it **`aapatsetu`**, collation `utf8mb4_unicode_ci`
- Click Create

> 💡 You don't *need* to create it manually — the app auto-creates it on first run. But doing it in phpMyAdmin lets you watch it appear.

## 3. Edit credentials (only if your MySQL has a password)
Open `backend/.env` and update the connection string:
```env
DATABASE_URL=mysql+pymysql://root:YOUR_PASSWORD@localhost:3306/aapatsetu?charset=utf8mb4
SECRET_KEY=change-this-to-any-long-random-string
```
Default XAMPP has `root` with no password, so the default `mysql+pymysql://root:@localhost:3306/aapatsetu?charset=utf8mb4` will work out of the box.

## 4. Run the app
```bash
./run.sh
```
That's it. The app will:
- Install backend + frontend deps
- Build the React UI
- Create all tables automatically on first start
- Seed 5 demo users + 7 sample incidents

## 5. Open it
- **Public project website:** http://localhost:8000/
- **The live app (login):** http://localhost:8000/app
- **API docs (Swagger):** http://localhost:8000/docs
- **View/edit data:** http://localhost/phpmyadmin → select `aapatsetu`

## 6. Reset the database
To wipe everything back to fresh demo data:
```sql
-- in phpMyAdmin: drop the database, or run:
DROP DATABASE aapatsetu; CREATE DATABASE aapatsetu CHARACTER SET utf8mb4;
```
Then restart the app — tables and demo data will be recreated.

## 📋 Demo logins (password: `demo1234`)
| Phone | Role |
|---|---|
| 9800000001 | Citizen |
| 9800000002 | Volunteer |
| 9800000003 | Volunteer |
| 9800000004 | Responder |
| 9800000005 | Responder |

## 🔐 JWT Authentication details
- Tokens are issued at `/api/auth/login` and `/api/auth/register`
- Token lifetime: 24 hours (set in `app/config.py`)
- Include in requests as `Authorization: Bearer <token>`
- Passwords hashed with bcrypt
- Schema: `users.password_hash` VARCHAR(255)

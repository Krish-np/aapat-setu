import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
from .config import settings

# Use APP_DATABASE_URL / settings.database_url; never let Replit's managed
# DATABASE_URL (Postgres) silently override the configured SQLite default.
db_url = settings.database_url
connect_args = {"check_same_thread": False} if db_url.startswith("sqlite") else {}
engine = create_engine(
    db_url,
    connect_args=connect_args,
    future=True,
    pool_pre_ping=True,
    pool_recycle=1800,
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, future=True)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def _database_exists(url: str) -> bool:
    """Check if the target MySQL database exists; create it if not."""
    if not url.startswith("mysql"):
        return True
    # Parse mysql+pymysql://user:pass@host:port/dbname?args
    from sqlalchemy.engine import make_url
    u = make_url(url)
    dbname = u.database
    if not dbname:
        return True
    # Connect without a database
    temp_url = u.set(database="")
    tmp = create_engine(temp_url, connect_args={}, future=True)
    try:
        with tmp.connect() as conn:
            conn.execute(text(
                f"CREATE DATABASE IF NOT EXISTS `{dbname}` "
                "CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
            ))
            conn.commit()
        return True
    finally:
        tmp.dispose()

import os
from pathlib import Path
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles

from .config import settings
from .database import Base, engine, SessionLocal, _database_exists
from . import models  # noqa: F401
from .routers import auth, incidents, tasks, alerts
from .ws_manager import manager
from .seed import seed_db

# Path to bundled landing page (shown at /) and built SPA app (at /app)
LANDING_HTML = Path(__file__).parent / "landing.html"
FRONTEND_DIR = Path(__file__).parent.parent / "static"


def create_app() -> FastAPI:
    # Ensure MySQL database exists & create all tables
    _database_exists(settings.database_url)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        seed_db(db)
    finally:
        db.close()

    app = FastAPI(
        title=settings.app_name,
        version="1.0.0",
        description="AI-powered emergency coordination platform — HackFusion 2026",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(auth.router)
    app.include_router(incidents.router)
    app.include_router(tasks.router)
    app.include_router(alerts.router)

    @app.get("/api/health")
    def health():
        return {
            "ok": True,
            "app": settings.app_name,
            "db": "mysql+pymysql" if settings.database_url.startswith("mysql") else "sqlite",
        }

    @app.websocket("/ws")
    async def websocket_endpoint(ws: WebSocket):
        await manager.connect(ws)
        try:
            while True:
                _ = await ws.receive_text()
        except WebSocketDisconnect:
            await manager.disconnect(ws)
        except Exception:
            await manager.disconnect(ws)

    # ---------- Public landing page at root ----------
    @app.get("/", response_class=HTMLResponse, include_in_schema=False)
    def landing():
        if LANDING_HTML.exists():
            return LANDING_HTML.read_text(encoding="utf-8")
        return HTMLResponse(
            "<h1>Aapat Setu</h1><p><a href='/app'>Open app →</a></p>"
        )

    # ---------- Serve SPA if built ----------
    if FRONTEND_DIR.is_dir():
        app.mount(
            "/assets",
            StaticFiles(directory=str(FRONTEND_DIR / "assets")),
            name="assets",
        )

        @app.get("/app", response_class=HTMLResponse, include_in_schema=False)
        def spa_entry():
            return FileResponse(str(FRONTEND_DIR / "index.html"))

        @app.get("/app/{full_path:path}", include_in_schema=False)
        def spa_deep(full_path: str):
            return FileResponse(str(FRONTEND_DIR / "index.html"))

    return app


app = create_app()

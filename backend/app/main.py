import os
from pathlib import Path
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, FileResponse, JSONResponse

from .config import settings
from .database import Base, engine, SessionLocal, _database_exists
from . import models  # noqa
from .routers import auth, incidents, tasks, alerts, notifications, resources, admin
from .ws_manager import manager
from .seed import seed_db

LANDING_HTML = Path(__file__).parent / "landing.html"
FRONTEND_DIR = Path(__file__).parent.parent / "static"


def create_app() -> FastAPI:
    _database_exists(settings.database_url)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try: seed_db(db)
    finally: db.close()

    app = FastAPI(title=settings.app_name, version="2.0.0",
                  description="Aapat Setu v2 — AI Emergency Coordination Platform")
    app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

    app.include_router(auth.router)
    app.include_router(incidents.router)
    app.include_router(tasks.router)
    app.include_router(alerts.router)
    app.include_router(notifications.router)
    app.include_router(resources.router)
    app.include_router(admin.router)

    @app.get("/api/health")
    def health():
        return {"ok": True, "app": settings.app_name, "version": "2.0",
                "db": "mysql+pymysql" if settings.database_url.startswith("mysql") else "sqlite"}

    @app.websocket("/ws")
    async def ws_endpoint(ws: WebSocket):
        await manager.connect(ws)
        try:
            while True:
                await ws.receive_text()
        except (WebSocketDisconnect, Exception):
            await manager.disconnect(ws)

    # Public landing page is now served by React SPA for unified theme/language toggles.
    # Keep a minimal health-check at /api/health; /* all fall through to SPA.

    # Serve SPA under / and /app/*
    if FRONTEND_DIR.is_dir():
        from fastapi.staticfiles import StaticFiles
        app.mount("/assets", StaticFiles(directory=str(FRONTEND_DIR / "assets")), name="assets")

        @app.get("/", response_class=HTMLResponse, include_in_schema=False)
        def spa_root():
            return FileResponse(str(FRONTEND_DIR / "index.html"))

        @app.get("/app", response_class=HTMLResponse, include_in_schema=False)
        def spa_app():
            return FileResponse(str(FRONTEND_DIR / "index.html"))

        @app.get("/{full_path:path}", include_in_schema=False)
        def spa_catchall(full_path: str):
            # API routes handled above; everything else goes to SPA.
            if full_path.startswith("api/") or full_path == "ws":
                return JSONResponse({"detail": "Not found"}, status_code=404)
            candidate = FRONTEND_DIR / full_path
            if full_path and candidate.is_file():
                return FileResponse(str(candidate))
            return FileResponse(str(FRONTEND_DIR / "index.html"))

    return app


app = create_app()

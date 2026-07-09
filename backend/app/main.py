import os
import json
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from .config import settings
from .database import Base, engine, SessionLocal
from . import models  # noqa: F401  (register models)
from .routers import auth, incidents, tasks, alerts
from .ws_manager import manager
from .seed import seed_db


def create_app() -> FastAPI:
    # Create tables
    Base.metadata.create_all(bind=engine)
    # Seed demo data
    db = SessionLocal()
    try:
        seed_db(db)
    finally:
        db.close()

    app = FastAPI(title=settings.app_name, version="1.0.0")

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
        return {"ok": True, "app": settings.app_name}

    @app.websocket("/ws")
    async def websocket_endpoint(ws: WebSocket):
        await manager.connect(ws)
        try:
            while True:
                # Keep connection alive; client can send ping payloads
                _ = await ws.receive_text()
        except WebSocketDisconnect:
            await manager.disconnect(ws)
        except Exception:
            await manager.disconnect(ws)

    # Serve static frontend if built
    static_dir = os.path.join(os.path.dirname(__file__), "..", "static")
    if os.path.isdir(static_dir):
        app.mount("/assets", StaticFiles(directory=os.path.join(static_dir, "assets")), name="assets")

        @app.get("/{full_path:path}")
        async def serve_spa(full_path: str):
            from fastapi.responses import FileResponse
            index = os.path.join(static_dir, "index.html")
            if full_path.startswith("api/") or full_path == "ws":
                return JSONResponse({"detail": "Not found"}, status_code=404)
            return FileResponse(index)

    return app


app = create_app()

import asyncio
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import get_db
from ..security import get_current_user, require_roles
from ..ws_manager import manager

router = APIRouter(prefix="/api/alerts", tags=["alerts"])


@router.get("", response_model=List[schemas.AlertOut])
def list_alerts(db: Session = Depends(get_db), current: models.User = Depends(get_current_user)):
    return db.query(models.Alert).order_by(models.Alert.created_at.desc()).limit(50).all()


@router.post("", response_model=schemas.AlertOut)
async def create(payload: schemas.AlertCreate, db: Session = Depends(get_db), current: models.User = Depends(get_current_user)):
    a = models.Alert(
        title=payload.title, message=payload.message, severity=payload.severity,
        lat=payload.lat, lng=payload.lng, radius_km=payload.radius_km, created_by=current.id,
    )
    db.add(a); db.commit(); db.refresh(a)
    out = schemas.AlertOut.model_validate(a)
    payload = out.model_dump(mode="json")
    await manager.broadcast("alert_created", payload)

    # Email broadcast on critical/warning alerts (non-blocking)
    try:
        from ..email_service import send_alert_email, format_alert_html, is_configured
        if is_configured() and payload.get("severity") in ("critical", "warning"):
            asyncio.create_task(
                send_alert_email(
                    subject=f"📢 PUBLIC ALERT [{(payload.get('severity') or '').upper()}]: {payload.get('title','')}",
                    body_html=format_alert_html({
                        "incident_type": "public_alert",
                        "ai_severity": payload.get("severity"),
                        "ai_summary": payload.get("message"),
                        "address": "Broadcast",
                        "created_at": payload.get("created_at"),
                    }),
                )
            )
    except Exception:
        pass

    return out

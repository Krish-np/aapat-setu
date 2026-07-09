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
    await manager.broadcast("alert_created", out.model_dump(mode="json"))
    return out

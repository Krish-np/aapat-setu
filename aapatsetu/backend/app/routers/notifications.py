from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import get_db
from ..security import get_current_user

router = APIRouter(prefix="/api/notifications", tags=["notifications"])


@router.get("", response_model=List[schemas.NotificationOut])
def list_my(db: Session = Depends(get_db), current: models.User = Depends(get_current_user)):
    # For demo, return global notifications + user-specific ones seeded from recent incidents
    out = db.query(models.Notification).filter(models.Notification.user_id == current.id).order_by(models.Notification.created_at.desc()).limit(50).all()
    return out


def create_notification(db: Session, user_id: int, title: str, message: str = None, kind: str = "info", incident_id: int = None):
    db.add(models.Notification(user_id=user_id, title=title, message=message, kind=kind, incident_id=incident_id))
    db.commit()

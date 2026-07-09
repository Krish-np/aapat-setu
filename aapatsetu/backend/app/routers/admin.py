from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from .. import models
from ..database import get_db
from ..security import get_current_user, require_roles
from ..ai import predict_future_risk

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/users")
def list_users(db: Session = Depends(get_db), current: models.User = Depends(require_roles("admin"))):
    return db.query(models.User).all()


@router.get("/predict")
def predict(db: Session = Depends(get_db), current: models.User = Depends(get_current_user)):
    incs = db.query(models.Incident).filter(models.Incident.status != models.IncidentStatus.resolved).all()
    return predict_future_risk(incs)


@router.get("/full-stats")
def full_stats(db: Session = Depends(get_db), current: models.User = Depends(get_current_user)):
    total_users = db.query(func.count(models.User.id)).scalar() or 0
    by_role = dict(db.query(models.User.role, func.count(models.User.id)).group_by(models.User.role).all())
    total_incidents = db.query(func.count(models.Incident.id)).scalar() or 0
    total_resources = db.query(func.count(models.Resource.id)).scalar() or 0
    return {
        "total_users": total_users,
        "by_role": {str(k.value): v for k,v in by_role.items()},
        "total_incidents": total_incidents,
        "total_resources": total_resources,
    }

from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func

from .. import models, schemas
from ..database import get_db
from ..security import get_current_user, require_roles
from ..ai import process_new_report
from ..ws_manager import manager

router = APIRouter(prefix="/api/incidents", tags=["incidents"])


def _to_out(inc: models.Incident, db: Session) -> schemas.IncidentOut:
    reporter = db.query(models.User).filter(models.User.id == inc.reporter_id).first()
    history = (
        db.query(models.StatusHistory)
        .filter(models.StatusHistory.incident_id == inc.id)
        .order_by(models.StatusHistory.created_at.asc())
        .all()
    )
    return schemas.IncidentOut(
        id=inc.id, reporter_id=inc.reporter_id,
        incident_type=inc.incident_type, description=inc.description,
        ai_summary=inc.ai_summary, ai_priority=inc.ai_priority,
        ai_verified=inc.ai_verified, ai_flag_reason=inc.ai_flag_reason,
        is_duplicate_of=inc.is_duplicate_of,
        lat=inc.lat, lng=inc.lng, severity=inc.severity, status=inc.status,
        photo_url=inc.photo_url, address=inc.address,
        created_at=inc.created_at, updated_at=inc.updated_at,
        reporter=schemas.ReporterBrief(id=reporter.id, name=reporter.name, phone=reporter.phone) if reporter else None,
        history=[schemas.StatusHistoryOut.model_validate(h) for h in history],
    )


@router.post("", response_model=schemas.IncidentOut)
async def create_incident(
    payload: schemas.IncidentCreate,
    db: Session = Depends(get_db),
    current: models.User = Depends(get_current_user),
):
    # Fetch existing open incidents for duplicate detection
    existing = (
        db.query(models.Incident)
        .filter(models.Incident.status != models.IncidentStatus.resolved)
        .all()
    )
    ai = process_new_report(
        incident_type=payload.incident_type,
        description=payload.description,
        lat=payload.lat, lng=payload.lng,
        existing=existing,
        severity_hint=payload.severity.value if payload.severity else None,
    )

    # If flagged as spam/nonsensical, still store it but mark unverified with reason
    if not ai["ai_verified"]:
        inc_status = models.IncidentStatus.reported
    else:
        inc_status = models.IncidentStatus.reported  # still starts as reported; responder verifies or auto-promote

    inc = models.Incident(
        reporter_id=current.id,
        incident_type=ai["cleaned_type"],
        description=payload.description,
        ai_summary=ai["ai_summary"],
        ai_priority=ai["ai_priority"],
        ai_verified=ai["ai_verified"],
        ai_flag_reason=ai["ai_flag_reason"],
        is_duplicate_of=ai["duplicate_of"],
        lat=payload.lat,
        lng=payload.lng,
        severity=ai["ai_priority"] or models.IncidentSeverity.medium,
        status=inc_status,
        photo_url=payload.photo_url,
        address=payload.address,
    )
    db.add(inc)
    db.commit()
    db.refresh(inc)

    # Log status history entry
    hist = models.StatusHistory(
        incident_id=inc.id, from_status=None, to_status=inc.status.value,
        note="Report submitted. AI analysis complete.", changed_by=current.id,
    )
    db.add(hist)
    db.commit()
    db.refresh(inc)

    # Auto create a volunteer-task row so volunteers see it as available
    task = models.Task(incident_id=inc.id, volunteer_id=None, status=models.TaskStatus.pending)
    db.add(task)
    db.commit()

    out = _to_out(inc, db)
    await manager.broadcast("incident_created", out.model_dump(mode="json"))
    return out


@router.get("", response_model=List[schemas.IncidentOut])
def list_incidents(
    status_filter: Optional[str] = Query(None, alias="status"),
    mine: bool = Query(False),
    db: Session = Depends(get_db),
    current: models.User = Depends(get_current_user),
):
    q = db.query(models.Incident)
    if status_filter:
        statuses = [s.strip() for s in status_filter.split(",")]
        q = q.filter(models.Incident.status.in_(statuses))
    if mine and current.role == models.UserRole.citizen:
        q = q.filter(models.Incident.reporter_id == current.id)
    incs = q.order_by(models.Incident.created_at.desc()).all()
    return [_to_out(i, db) for i in incs]


@router.get("/{incident_id}", response_model=schemas.IncidentOut)
def get_incident(incident_id: int, db: Session = Depends(get_db), current: models.User = Depends(get_current_user)):
    inc = db.query(models.Incident).filter(models.Incident.id == incident_id).first()
    if not inc:
        raise HTTPException(404, "Incident not found")
    return _to_out(inc, db)


@router.patch("/{incident_id}", response_model=schemas.IncidentOut)
async def update_incident(
    incident_id: int,
    payload: schemas.IncidentUpdate,
    db: Session = Depends(get_db),
    current: models.User = Depends(require_roles("responder")),
):
    inc = db.query(models.Incident).filter(models.Incident.id == incident_id).first()
    if not inc:
        raise HTTPException(404, "Incident not found")
    old_status = inc.status
    if payload.severity is not None:
        inc.severity = payload.severity
    if payload.status is not None:
        inc.status = payload.status
    inc.updated_at = datetime.utcnow()
    if payload.status is not None and payload.status != old_status:
        hist = models.StatusHistory(
            incident_id=inc.id,
            from_status=old_status.value,
            to_status=payload.status.value,
            note=payload.notes or f"Status updated to {payload.status.value}",
            changed_by=current.id,
        )
        db.add(hist)
    db.commit()
    db.refresh(inc)
    out = _to_out(inc, db)
    await manager.broadcast("incident_updated", out.model_dump(mode="json"))
    return out


@router.get("/stats/summary")
def stats_summary(db: Session = Depends(get_db), current: models.User = Depends(get_current_user)):
    total = db.query(func.count(models.Incident.id)).scalar() or 0
    by_status = dict(
        db.query(models.Incident.status, func.count(models.Incident.id))
        .group_by(models.Incident.status).all()
    )
    by_priority = dict(
        db.query(models.Incident.severity, func.count(models.Incident.id))
        .group_by(models.Incident.severity).all()
    )
    by_type = dict(
        db.query(models.Incident.incident_type, func.count(models.Incident.id))
        .group_by(models.Incident.incident_type).all()
    )
    # Recent (24h) per-hour counts
    return {
        "total": total,
        "by_status": {k.value if hasattr(k, "value") else str(k): v for k, v in by_status.items()},
        "by_priority": {k.value if hasattr(k, "value") else str(k): v for k, v in by_priority.items()},
        "by_type": by_type,
    }

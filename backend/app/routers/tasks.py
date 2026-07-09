from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from .. import models, schemas
from ..database import get_db
from ..security import get_current_user, require_roles
from ..ai import haversine_km
from ..ws_manager import manager

router = APIRouter(prefix="/api/tasks", tags=["tasks"])


def _to_out(task: models.Task, db: Session) -> schemas.TaskOut:
    inc = db.query(models.Incident).filter(models.Incident.id == task.incident_id).first()
    vol = db.query(models.User).filter(models.User.id == task.volunteer_id).first() if task.volunteer_id else None
    return schemas.TaskOut(
        id=task.id, incident_id=task.incident_id, volunteer_id=task.volunteer_id,
        status=task.status, notes=task.notes,
        created_at=task.created_at, updated_at=task.updated_at,
        incident=schemas.IncidentBrief.model_validate(inc) if inc else None,
        volunteer=schemas.VolunteerBrief(id=vol.id, name=vol.name, phone=vol.phone) if vol else None,
    )


@router.get("", response_model=List[schemas.TaskOut])
def list_tasks(db: Session = Depends(get_db), current: models.User = Depends(get_current_user)):
    q = db.query(models.Task)
    if current.role == models.UserRole.volunteer:
        # Show unassigned pending + my tasks
        q = q.filter(
            (models.Task.volunteer_id == None) | (models.Task.volunteer_id == current.id)  # noqa: E711
        )
    tasks = q.order_by(models.Task.created_at.desc()).all()
    return [_to_out(t, db) for t in tasks]


@router.post("/{task_id}/claim", response_model=schemas.TaskOut)
async def claim_task(task_id: int, db: Session = Depends(get_db),
                     current: models.User = Depends(require_roles("volunteer", "responder"))):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(404, "Task not found")
    if task.volunteer_id is not None and task.volunteer_id != current.id:
        raise HTTPException(400, "Task already claimed by another volunteer")
    task.volunteer_id = current.id
    task.status = models.TaskStatus.claimed
    task.updated_at = datetime.utcnow()

    inc = db.query(models.Incident).filter(models.Incident.id == task.incident_id).first()
    if inc and inc.status in (models.IncidentStatus.reported, models.IncidentStatus.verified):
        old = inc.status
        inc.status = models.IncidentStatus.assigned
        db.add(models.StatusHistory(
            incident_id=inc.id, from_status=old.value, to_status="assigned",
            note=f"Task claimed by {current.name}", changed_by=current.id,
        ))
    db.commit()
    db.refresh(task)
    out = _to_out(task, db)
    await manager.broadcast("task_updated", out.model_dump(mode="json"))
    if inc:
        db.refresh(inc)
        from .incidents import _to_out as _inc_out
        await manager.broadcast("incident_updated", _inc_out(inc, db).model_dump(mode="json"))
    return out


@router.patch("/{task_id}", response_model=schemas.TaskOut)
async def update_task(task_id: int, payload: schemas.TaskUpdate, db: Session = Depends(get_db),
                      current: models.User = Depends(require_roles("volunteer", "responder"))):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(404, "Task not found")
    if task.volunteer_id and task.volunteer_id != current.id and current.role != models.UserRole.responder:
        raise HTTPException(403, "Not assigned to you")
    task.status = payload.status
    if payload.notes is not None:
        if task.notes:
            task.notes = task.notes + f"\n[{current.name}] {payload.notes}"
        else:
            task.notes = f"[{current.name}] {payload.notes}"
    task.updated_at = datetime.utcnow()

    # Sync incident status
    inc = db.query(models.Incident).filter(models.Incident.id == task.incident_id).first()
    if inc:
        old = inc.status
        if payload.status == models.TaskStatus.in_progress and inc.status != models.IncidentStatus.in_progress:
            inc.status = models.IncidentStatus.in_progress
        elif payload.status == models.TaskStatus.completed and inc.status != models.IncidentStatus.resolved:
            inc.status = models.IncidentStatus.resolved
        if inc.status != old:
            db.add(models.StatusHistory(
                incident_id=inc.id, from_status=old.value, to_status=inc.status.value,
                note=f"Task {payload.status.value}: {payload.notes or ''}", changed_by=current.id,
            ))
    db.commit()
    db.refresh(task)
    out = _to_out(task, db)
    await manager.broadcast("task_updated", out.model_dump(mode="json"))
    if inc:
        db.refresh(inc)
        from .incidents import _to_out as _inc_out
        await manager.broadcast("incident_updated", _inc_out(inc, db).model_dump(mode="json"))
    return out


@router.get("/nearby", response_model=List[schemas.TaskOut])
def nearby_tasks(lat: float, lng: float, radius_km: float = 5.0,
                 db: Session = Depends(get_db),
                 current: models.User = Depends(require_roles("volunteer", "responder"))):
    tasks = db.query(models.Task).filter(models.Task.volunteer_id == None).all()  # noqa: E711
    results = []
    for t in tasks:
        inc = db.query(models.Incident).filter(models.Incident.id == t.incident_id).first()
        if not inc:
            continue
        if haversine_km(lat, lng, inc.lat, inc.lng) <= radius_km:
            results.append(_to_out(t, db))
    return results

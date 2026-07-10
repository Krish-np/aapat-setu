from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import get_db
from ..security import get_current_user, require_roles
from ..ws_manager import manager

router = APIRouter(prefix="/api/tasks", tags=["tasks"])


def _to_out(t: models.Task, db: Session) -> schemas.TaskOut:
    return schemas.TaskOut.model_validate(t)


@router.get("", response_model=List[schemas.TaskOut])
def list_tasks(db: Session = Depends(get_db), current: models.User = Depends(get_current_user)):
    q = db.query(models.Task)

    # Role-based scoping — departments only see tasks relevant to them.
    role = current.role
    role_task_map = {
        models.UserRole.hospital:     ["medical"],
        models.UserRole.fire:         ["fire", "rescue"],
        models.UserRole.police:       ["police", "rescue"],
        models.UserRole.ngo:          ["shelter", "food", "water", "transport", "other"],
        models.UserRole.municipality: ["rescue", "shelter", "transport", "other", "water", "food"],
    }

    if role == models.UserRole.citizen:
        # Citizens don't use the task board (but if authenticated, show nothing)
        return []
    if role == models.UserRole.volunteer:
        # Volunteers see unclaimed tasks OR tasks they claimed
        q = q.filter(
            (models.Task.assignee_id == None) | (models.Task.assignee_id == current.id)
        )
    elif role in role_task_map:
        # Department: see tasks matching their assignee_role/task_type OR assigned to them OR unassigned for them
        focus_types = role_task_map[role]
        q = q.join(models.Incident, models.Incident.id == models.Task.incident_id, isouter=True).filter(
            (models.Task.assignee_id == current.id)
            | (models.Task.assignee_role == role.value)
            | (models.Task.task_type.in_(focus_types))
        )
    # responder/admin see all (no extra filter)
    return q.order_by(models.Task.created_at.desc()).all()


@router.post("/{task_id}/claim", response_model=schemas.TaskOut)
async def claim(task_id: int, db: Session = Depends(get_db), current: models.User = Depends(get_current_user)):
    t = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not t: raise HTTPException(404, "Not found")
    if t.assignee_id and t.assignee_id != current.id: raise HTTPException(400, "Already claimed")
    t.assignee_id = current.id; t.status = models.TaskStatus.claimed; t.updated_at = datetime.utcnow()
    inc = db.query(models.Incident).filter(models.Incident.id == t.incident_id).first()
    if inc and inc.status == models.IncidentStatus.verified:
        old = inc.status; inc.status = models.IncidentStatus.assigned
        db.add(models.StatusHistory(incident_id=inc.id, from_status=old.value, to_status="assigned", note=f"Task claimed by {current.name}"))
    db.commit(); db.refresh(t)
    out = _to_out(t, db)
    await manager.broadcast("task_updated", out.model_dump(mode="json"))
    return out


@router.patch("/{task_id}", response_model=schemas.TaskOut)
async def update(task_id: int, payload: schemas.TaskUpdate, db: Session = Depends(get_db), current: models.User = Depends(get_current_user)):
    t = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not t: raise HTTPException(404, "Not found")
    if t.assignee_id and t.assignee_id != current.id and current.role not in (models.UserRole.responder, models.UserRole.admin):
        raise HTTPException(403, "Not assigned to you")
    if not t.assignee_id: t.assignee_id = current.id
    t.status = payload.status; t.updated_at = datetime.utcnow()
    if payload.notes: t.notes = (t.notes + f"\n[{current.name}] {payload.notes}" if t.notes else f"[{current.name}] {payload.notes}")
    inc = db.query(models.Incident).filter(models.Incident.id == t.incident_id).first()
    if inc:
        old = inc.status
        mapping = {
            "claimed": models.IncidentStatus.assigned,
            "en_route": models.IncidentStatus.en_route,
            "on_site": models.IncidentStatus.on_site,
            "in_progress": models.IncidentStatus.rescue_ongoing,
            "completed": models.IncidentStatus.resolved,
        }
        new = mapping.get(payload.status.value)
        if new and inc.status != new:
            inc.status = new
            db.add(models.StatusHistory(incident_id=inc.id, from_status=old.value, to_status=new.value, note=payload.notes or f"Task {payload.status.value}"))
    db.commit(); db.refresh(t)
    out = _to_out(t, db)
    await manager.broadcast("task_updated", out.model_dump(mode="json"))
    return out

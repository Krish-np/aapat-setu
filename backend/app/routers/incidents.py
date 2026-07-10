import asyncio
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from .. import models, schemas
from ..database import get_db
from ..security import get_current_user, require_roles
from ..ai import process_report
from ..ws_manager import manager

router = APIRouter(prefix="/api/incidents", tags=["incidents"])


def _to_out(inc: models.Incident, db: Session) -> schemas.IncidentOut:
    reporter = db.query(models.User).filter(models.User.id == inc.reporter_id).first()
    history = db.query(models.StatusHistory).filter(models.StatusHistory.incident_id == inc.id).order_by(models.StatusHistory.created_at.asc()).all()
    tasks = db.query(models.Task).filter(models.Task.incident_id == inc.id).all()
    return schemas.IncidentOut(
        id=inc.id, reporter_id=inc.reporter_id, incident_type=inc.incident_type,
        description=inc.description, people_affected=inc.people_affected or 0,
        contact_number=inc.contact_number,
        ai_summary=inc.ai_summary, ai_summary_ne=inc.ai_summary_ne,
        ai_severity=inc.ai_severity, ai_confidence=inc.ai_confidence,
        ai_priority_score=inc.ai_priority_score,
        ai_estimated_victims=inc.ai_estimated_victims,
        ai_response_time_min=inc.ai_response_time_min,
        ai_rescue_difficulty=inc.ai_rescue_difficulty,
        ai_risk_score=inc.ai_risk_score,
        ai_risk_factors=inc.ai_risk_factors,
        ai_required_resources=inc.ai_required_resources,
        ai_suggested_responders=inc.ai_suggested_responders,
        ai_safety_instructions=inc.ai_safety_instructions,
        ai_safety_instructions_ne=inc.ai_safety_instructions_ne,
        ai_image_findings=inc.ai_image_findings,
        ai_damage_assessment=inc.ai_damage_assessment,
        ai_duplicate_of=inc.ai_duplicate_of,
        ai_verified=inc.ai_verified, ai_flag_reason=inc.ai_flag_reason,
        lat=inc.lat, lng=inc.lng, severity=inc.severity, status=inc.status,
        photo_urls=inc.photo_urls, address=inc.address, eta_minutes=inc.eta_minutes,
        created_at=inc.created_at, updated_at=inc.updated_at,
        reporter=schemas.ReporterBrief(id=reporter.id, name=reporter.name, phone=reporter.phone) if reporter else None,
        history=[schemas.StatusHistoryOut.model_validate(h) for h in history],
        tasks=[schemas.TaskBrief.model_validate(t) for t in tasks],
    )


@router.post("", response_model=schemas.IncidentOut)
async def create_incident(payload: schemas.IncidentCreate, db: Session = Depends(get_db), current: models.User = Depends(get_current_user)):
    existing = db.query(models.Incident).filter(models.Incident.status != models.IncidentStatus.resolved).all()
    has_images = bool(payload.photo_urls)
    ai = process_report(
        incident_type=payload.incident_type, description=payload.description,
        lat=payload.lat, lng=payload.lng, existing=existing,
        people_affected=payload.people_affected, has_images=has_images,
        voice_transcript=payload.voice_transcript,
    )
    # Move status straight to ai_processing for the animation feel
    inc_status = models.IncidentStatus.ai_processing
    inc = models.Incident(
        reporter_id=current.id, incident_type=ai["category"], description=payload.description,
        people_affected=payload.people_affected or ai["ai_estimated_victims"],
        contact_number=payload.contact_number, lat=payload.lat, lng=payload.lng,
        photo_urls=payload.photo_urls, voice_url=payload.voice_url,
        voice_transcript=ai["voice_transcript"],
        address=payload.address, language=ai["language"],
        ai_summary=ai["ai_summary"], ai_summary_ne=ai["ai_summary_ne"],
        ai_severity=ai["ai_severity"], ai_confidence=ai["ai_confidence"],
        ai_priority_score=ai["ai_priority_score"],
        ai_estimated_victims=ai["ai_estimated_victims"],
        ai_response_time_min=ai["ai_response_time_min"],
        ai_rescue_difficulty=ai["ai_rescue_difficulty"],
        ai_risk_score=ai["ai_risk_score"], ai_risk_factors=ai["ai_risk_factors"],
        ai_required_resources=ai["ai_required_resources"],
        ai_suggested_responders=ai["ai_suggested_responders"],
        ai_safety_instructions=ai["ai_safety_instructions"],
        ai_safety_instructions_ne=ai["ai_safety_instructions_ne"],
        ai_image_findings=ai["ai_image_findings"],
        ai_damage_assessment=ai["ai_damage_assessment"],
        ai_duplicate_of=ai["ai_duplicate_of"], ai_verified=ai["ai_verified"],
        ai_flag_reason=ai["ai_flag_reason"],
        severity=ai["ai_severity"] or models.IncidentSeverity.moderate,
        status=inc_status, eta_minutes=ai["ai_response_time_min"],
    )
    db.add(inc); db.commit(); db.refresh(inc)
    db.add(models.StatusHistory(incident_id=inc.id, from_status=None, to_status=inc_status.value, note="Report received. AI processing...", changed_by=current.id))
    db.commit()

    # Auto-advance to 'submitted' then 'verified' after AI done (in a real system async; here immediate)
    if ai["ai_verified"]:
        inc.status = models.IncidentStatus.verified
        db.add(models.StatusHistory(incident_id=inc.id, from_status="ai_processing", to_status="verified", note="AI verification complete. Ready for dispatch.", changed_by=None))
    else:
        inc.status = models.IncidentStatus.submitted
        db.add(models.StatusHistory(incident_id=inc.id, from_status="ai_processing", to_status="submitted", note=f"Flagged: {ai['ai_flag_reason']}", changed_by=None))

    # Create tasks for suggested responder types
    for role in (ai["ai_suggested_responders"] or ["responder"]):
        ttype = {"fire":"fire","hospital":"medical","police":"police","ngo":"food","municipality":"other","volunteer":"rescue","responder":"rescue"}.get(role,"rescue")
        db.add(models.Task(incident_id=inc.id, task_type=ttype, assignee_role=role, status=models.TaskStatus.pending))
    db.commit(); db.refresh(inc)
    out = _to_out(inc, db)
    payload = out.model_dump(mode="json")
    await manager.broadcast("incident_created", payload)

    # Email alert for critical/high severity incidents (non-blocking)
    from ..email_service import send_alert_email, format_alert_html, is_configured
    if is_configured() and (ai.get("ai_severity") in ("critical", "high")):
        try:
            asyncio.create_task(
                send_alert_email(
                    subject=f"🚨 [{(ai.get('ai_severity') or '').upper()}] {inc.incident_type.replace('_',' ').title()}",
                    body_html=format_alert_html(payload),
                )
            )
        except Exception:
            pass

    return out


@router.get("", response_model=List[schemas.IncidentOut])
def list_incidents(status_filter: Optional[str] = Query(None, alias="status"), mine: bool = Query(False), db: Session = Depends(get_db), current: models.User = Depends(get_current_user)):
    q = db.query(models.Incident)
    if status_filter:
        q = q.filter(models.Incident.status.in_([s.strip() for s in status_filter.split(",")]))
    if mine and current.role == models.UserRole.citizen:
        q = q.filter(models.Incident.reporter_id == current.id)
    incs = q.order_by(models.Incident.created_at.desc()).all()
    return [_to_out(i, db) for i in incs]


@router.get("/{incident_id}", response_model=schemas.IncidentOut)
def get_incident(incident_id: int, db: Session = Depends(get_db), current: models.User = Depends(get_current_user)):
    inc = db.query(models.Incident).filter(models.Incident.id == incident_id).first()
    if not inc: raise HTTPException(404, "Not found")
    return _to_out(inc, db)


@router.patch("/{incident_id}", response_model=schemas.IncidentOut)
async def update_incident(incident_id: int, payload: schemas.IncidentUpdate, db: Session = Depends(get_db), current: models.User = Depends(get_current_user)):
    inc = db.query(models.Incident).filter(models.Incident.id == incident_id).first()
    if not inc: raise HTTPException(404, "Not found")
    old_status = inc.status
    if payload.severity: inc.severity = payload.severity
    if payload.status: inc.status = payload.status
    inc.updated_at = datetime.utcnow()
    if payload.status and payload.status != old_status:
        db.add(models.StatusHistory(incident_id=inc.id, from_status=old_status.value, to_status=payload.status.value, note=payload.notes or f"Status updated to {payload.status.value}", changed_by=current.id))
    db.commit(); db.refresh(inc)
    out = _to_out(inc, db)
    await manager.broadcast("incident_updated", out.model_dump(mode="json"))
    return out


@router.get("/stats/summary")
def stats(db: Session = Depends(get_db), current: models.User = Depends(get_current_user)):
    total = db.query(func.count(models.Incident.id)).scalar() or 0
    by_status = dict(db.query(models.Incident.status, func.count(models.Incident.id)).group_by(models.Incident.status).all())
    by_sev = dict(db.query(models.Incident.ai_severity, func.count(models.Incident.id)).group_by(models.Incident.ai_severity).all())
    by_type = dict(db.query(models.Incident.incident_type, func.count(models.Incident.id)).group_by(models.Incident.incident_type).all())
    return {
        "total": total,
        "by_status": {k.value if hasattr(k,"value") else str(k): v for k,v in by_status.items()},
        "by_severity": {k.value if hasattr(k,"value") else str(k): v for k,v in by_sev.items()},
        "by_type": by_type,
    }


@router.get("/pois/all")
def pois(db: Session = Depends(get_db), current: models.User = Depends(get_current_user)):
    rows = db.query(models.POI).all()
    out = []
    type_emoji = {"hospital":"🏥","police":"🚓","fire":"🚒","shelter":"🏠","safezone":"✅"}
    type_color = {"hospital":"#ec4899","police":"#64748b","fire":"#f97316","shelter":"#8b5cf6","safezone":"#10b981"}
    for r in rows:
        out.append({
            "id": r.id, "poi_type": r.poi_type, "name": r.name, "address": r.address, "phone": r.phone,
            "lat": r.lat, "lng": r.lng, "capacity": r.capacity, "available": r.available,
            "emoji": type_emoji.get(r.poi_type, "📍"),
            "color": type_color.get(r.poi_type, "#64748b"),
        })
    return out

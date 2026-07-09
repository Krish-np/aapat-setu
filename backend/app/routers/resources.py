from typing import List
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from .. import models
from ..database import get_db
from ..security import get_current_user

router = APIRouter(prefix="/api/resources", tags=["resources"])


from typing import Optional

class ResourceIn(BaseModel):
    resource_type: Optional[str] = None
    name: Optional[str] = None
    quantity: Optional[int] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    available: Optional[bool] = None


@router.get("")
def list_all(db: Session = Depends(get_db), current: models.User = Depends(get_current_user)):
    return db.query(models.Resource).all()


@router.post("")
def create(payload: ResourceIn, db: Session = Depends(get_db), current: models.User = Depends(get_current_user)):
    if not payload.resource_type:
        from fastapi import HTTPException
        raise HTTPException(400, "resource_type is required")
    r = models.Resource(
        owner_id=current.id,
        resource_type=payload.resource_type,
        name=payload.name,
        quantity=payload.quantity if payload.quantity is not None else 1,
        available=payload.available if payload.available is not None else True,
        lat=payload.lat or current.lat,
        lng=payload.lng or current.lng,
    )
    db.add(r); db.commit(); db.refresh(r)
    return r


@router.delete("/{resource_id}")
def delete(resource_id: int, db: Session = Depends(get_db), current: models.User = Depends(get_current_user)):
    r = db.query(models.Resource).filter(models.Resource.id == resource_id).first()
    if not r:
        from fastapi import HTTPException
        raise HTTPException(404, "Not found")
    db.delete(r); db.commit()
    return {"ok": True}


@router.patch("/{resource_id}")
def update(resource_id: int, payload: ResourceIn, db: Session = Depends(get_db), current: models.User = Depends(get_current_user)):
    r = db.query(models.Resource).filter(models.Resource.id == resource_id).first()
    if not r:
        from fastapi import HTTPException
        raise HTTPException(404, "Not found")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(r, k, v)
    db.commit(); db.refresh(r)
    return r


@router.get("/recommend/{incident_id}")
def recommend(incident_id: int, db: Session = Depends(get_db), current: models.User = Depends(get_current_user)):
    inc = db.query(models.Incident).filter(models.Incident.id == incident_id).first()
    if not inc: return []
    res = db.query(models.Resource).filter(models.Resource.available == True).all()
    def dist(r):
        if r.lat is None: return 99999
        from ..ai import haversine_km
        return haversine_km(inc.lat, inc.lng, r.lat, r.lng)
    type_map = {"fire_trucks":"fire_truck","firefighters":"crew","water_supply":"water","ambulance":"ambulance",
                "police":"police","rescue_boats":"boat","shelter":"shelter","food":"food","water":"water",
                "hospital_bed":"bed","blood":"blood","medicine":"medicine"}
    needed = inc.ai_required_resources or []
    recs=[]
    for n in needed:
        matches=[r for r in res if r.resource_type.lower().replace("_","").startswith(n[:5].lower().replace("_",""))]
        matches.sort(key=dist)
        for m in matches[:2]:
            recs.append({"resource":m,"distance_km":round(dist(m),2),"for":n})
    return recs

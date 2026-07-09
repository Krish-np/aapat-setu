from typing import List
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from .. import models
from ..database import get_db
from ..security import get_current_user

router = APIRouter(prefix="/api/resources", tags=["resources"])


class ResourceIn(BaseModel):
    resource_type: str
    name: str = None
    quantity: int = 1
    lat: float = None
    lng: float = None
    available: bool = True


@router.get("")
def list_all(db: Session = Depends(get_db), current: models.User = Depends(get_current_user)):
    return db.query(models.Resource).all()


@router.post("")
def create(payload: ResourceIn, db: Session = Depends(get_db), current: models.User = Depends(get_current_user)):
    r = models.Resource(owner_id=current.id, resource_type=payload.resource_type, name=payload.name,
                        quantity=payload.quantity, available=payload.available,
                        lat=payload.lat or current.lat, lng=payload.lng or current.lng)
    db.add(r); db.commit(); db.refresh(r)
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

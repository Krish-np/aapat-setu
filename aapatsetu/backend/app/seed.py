from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from . import models
from .security import hash_password

KTM_LAT, KTM_LNG = 27.7172, 85.3240

DEMO_USERS = [
    ("9800000001", "Citizen Demo", models.UserRole.citizen, None),
    ("9800000002", "Aasha Volunteer", models.UserRole.volunteer, "Rescue Nepal"),
    ("9800000003", "Bibek Volunteer", models.UserRole.volunteer, "Red Cross"),
    ("9800000004", "Sita Responder", models.UserRole.responder, "Disaster Management"),
    ("9800000005", "Disaster Control", models.UserRole.admin, "Government"),
    ("9800000010", "Bir Hospital", models.UserRole.hospital, "Bir Hospital"),
    ("9800000011", "Metro Police", models.UserRole.police, "Kathmandu Metro Police"),
    ("9800000012", "Fire Brigade", models.UserRole.fire, "Kathmandu Fire"),
    ("9800000013", "Red Cross Nepal", models.UserRole.ngo, "Nepal Red Cross"),
    ("9800000014", "Kathmandu Metro", models.UserRole.municipality, "Kathmandu Metropolitan"),
]

SAMPLE_INCIDENTS = [
    ("flood","Water has entered houses near the river, people trapped on roofs including children. Water rising fast, need rescue boats immediately.",
     models.IncidentSeverity.critical, models.IncidentStatus.verified, -0.012, 0.018, 1),
    ("fire","Small shop on fire near New Road. Smoke billowing, electrical short suspected. Fire brigade needed urgently as nearby shops are at risk.",
     models.IncidentSeverity.high, models.IncidentStatus.on_site, 0.004, -0.006, 1),
    ("medical","Road accident on Ring Road, two people injured. One unconscious with head injury. Traffic blocked, ambulance needed.",
     models.IncidentSeverity.high, models.IncidentStatus.dispatched, 0.008, 0.010, 1),
    ("landslide","Landslide blocked the highway about 2km from town. Mud and boulders, cars stuck. No injuries but slope still unstable.",
     models.IncidentSeverity.moderate, models.IncidentStatus.verified, 0.022, -0.030, 1),
    ("accident","Motorcycle hit a car at crossroads. Rider has minor injuries and is conscious but can't move. Police and ambulance requested.",
     models.IncidentSeverity.moderate, models.IncidentStatus.resolved, -0.008, -0.012, 1),
    ("building_collapse","Old wall collapsed after heavy rain. Two people feared trapped under debris. Neighbours trying to dig them out.",
     models.IncidentSeverity.critical, models.IncidentStatus.ai_processing, -0.003, 0.014, 1),
    ("storm","Fallen tree blocking the main road after a storm. No injuries but vehicles can't pass. Needs clearance team.",
     models.IncidentSeverity.low, models.IncidentStatus.verified, 0.015, 0.005, 1),
]

SAMPLE_POIS = [
    ("hospital", "Bir Hospital", "Maha Bauddha, Kathmandu", "01-4211119", 27.7068, 85.3116, 200, 25),
    ("hospital", "Tribhuvan University Teaching Hospital", "Maharajgunj", "01-4412404", 27.7333, 85.3250, 500, 80),
    ("police", "Metro Police Station New Road", "New Road", "100", 27.7050, 85.3150, 0, 0),
    ("fire", "Fire Station Basantapur", "Basantapur", "101", 27.7039, 85.3086, 0, 0),
    ("shelter", "Durbar High School Shelter", "Rani Pokhari", "", 27.7128, 85.3200, 300, 300),
    ("safezone", "Tundikhel Open Ground", "Tundikhel", "", 27.7056, 85.3168, 0, 0),
]


SAMPLE_RESOURCES = [
    ("ambulance", "Ambulance B-01", 2, 27.7100, 85.3200, True),
    ("ambulance", "Ambulance B-02", 1, 27.7200, 85.3300, True),
    ("fire_truck", "Fire Truck FT-1", 1, 27.7040, 85.3100, True),
    ("fire_truck", "Fire Truck FT-2", 1, 27.7200, 85.3200, True),
    ("police", "Patrol Car P-07", 3, 27.7100, 85.3150, True),
    ("rescue_boat", "Rescue Boat RB-1", 2, 27.7000, 85.3400, True),
    ("food", "Food Pack Stockpile (Red Cross)", 500, 27.7150, 85.3250, True),
    ("water", "Water Tanker WT-1", 2000, 27.7180, 85.3220, True),
    ("medicine", "Emergency Medical Kit", 200, 27.7160, 85.3240, True),
    ("shelter", "Temporary Shelter Capacity", 200, 27.7130, 85.3200, True),
]


def seed_db(db: Session):
    if db.query(models.User).count() > 0:
        return

    users = []
    for phone, name, role, org in DEMO_USERS:
        u = models.User(
            name=name, phone=phone, role=role, organization=org,
            password_hash=hash_password("demo1234"),
            lat=KTM_LAT + 0.005, lng=KTM_LNG + 0.005,
            is_verified=True, availability="available",
        )
        db.add(u); users.append(u)
    db.commit()
    for u in users: db.refresh(u)

    now = datetime.utcnow()
    citizen = users[0]
    hrs = [1, 3, 2, 5, 12, 0.5, 6]
    for (itype, desc, sev, status, dlat, dlng, _), h in zip(SAMPLE_INCIDENTS, hrs):
        inc = models.Incident(
            reporter_id=citizen.id, incident_type=itype, description=desc,
            people_affected=sev.value in ("critical","high") and 5 or 2,
            ai_summary=f"[{itype.replace('_',' ').title()}] {desc[:180]}",
            ai_summary_ne=f"[{itype}] {desc[:140]}",
            ai_severity=sev, ai_confidence=0.88, ai_priority_score=70,
            ai_estimated_victims=3, ai_response_time_min=10,
            ai_rescue_difficulty="high" if sev==models.IncidentSeverity.critical else "medium",
            ai_risk_score=75 if sev==models.IncidentSeverity.critical else 50,
            ai_risk_factors=["ongoing hazard","multiple civilians at risk"],
            ai_required_resources=["ambulance","responders","volunteers"],
            ai_suggested_responders=["responder","police"],
            ai_safety_instructions="Stay safe, move to higher ground.",
            ai_verified=True,
            lat=KTM_LAT+dlat, lng=KTM_LNG+dlng,
            severity=sev, status=status,
            address=f"Kathmandu",
            created_at=now-timedelta(hours=h), updated_at=now-timedelta(hours=h),
        )
        db.add(inc)
    db.commit()

    # POIs
    for ptype, name, addr, phone, lat, lng, cap, avail in SAMPLE_POIS:
        db.add(models.POI(
            poi_type=ptype, name=name, address=addr, phone=phone,
            lat=lat, lng=lng, capacity=cap, available=avail,
        ))
    db.commit()

    # Seed resources
    for rtype, name, qty, lat, lng, avail in SAMPLE_RESOURCES:
        db.add(models.Resource(
            owner_id=4, resource_type=rtype, name=name, quantity=qty,
            lat=lat, lng=lng, available=avail,
        ))
    db.commit()




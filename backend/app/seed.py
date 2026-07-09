"""Seed demo users and sample incidents so the platform looks alive at demo time."""
from datetime import datetime, timedelta
import random
from sqlalchemy.orm import Session
from . import models
from .security import hash_password

# Kathmandu area centroid (used for seeding realistic-looking points)
KTM_LAT, KTM_LNG = 27.7172, 85.3240

DEMO_USERS = [
    # phone, name, password, role
    ("9800000001", "Citizen Demo", "demo1234", models.UserRole.citizen, 27.7172, 85.3240),
    ("9800000002", "Aasha Volunteer", "demo1234", models.UserRole.volunteer, 27.7100, 85.3300),
    ("9800000003", "Bibek Volunteer", "demo1234", models.UserRole.volunteer, 27.7250, 85.3100),
    ("9800000004", "Sita Responder", "demo1234", models.UserRole.responder, 27.7172, 85.3240),
    ("9800000005", "Disaster Control", "demo1234", models.UserRole.responder, 27.7200, 85.3250),
]

SAMPLE_INCIDENTS = [
    # (type, desc, severity, status, lat_offset, lng_offset, hours_ago)
    ("flood",
     "Water has entered houses in our neighbourhood near the river. People on the ground floor are trapped, water rising fast. We need boats and rescue immediately. Children are stuck on the roof.",
     models.IncidentSeverity.critical, models.IncidentStatus.verified, -0.012, 0.018, 1),
    ("fire",
     "Small shop on fire near New Road. Smoke coming out, electrical short circuit seems to be cause. Please send fire brigade quickly, nearby shops are at risk.",
     models.IncidentSeverity.high, models.IncidentStatus.in_progress, 0.004, -0.006, 3),
    ("medical",
     "Road accident on ring road, two people injured. One person is bleeding from the head and appears unconscious. Traffic is blocked, ambulance needed urgently.",
     models.IncidentSeverity.high, models.IncidentStatus.assigned, 0.008, 0.010, 2),
    ("landslide",
     "Landslide has blocked the highway section about 2km from town. Mud and boulders on the road, cars stuck on both sides. No injuries reported yet but the slope is unstable.",
     models.IncidentSeverity.medium, models.IncidentStatus.reported, 0.022, -0.030, 5),
    ("accident",
     "Motorcycle collided with a car near the crossroads. Rider has minor injuries and is conscious but unable to move. Police and ambulance requested.",
     models.IncidentSeverity.medium, models.IncidentStatus.resolved, -0.008, -0.012, 12),
    ("building collapse",
     "Old wall of a house collapsed after heavy rain. Two people trapped under debris, neighbours are trying to dig them out. Critical rescue needed right now.",
     models.IncidentSeverity.critical, models.IncidentStatus.reported, -0.003, 0.014, 0.5),
    ("other",
     "Fallen tree blocking the main road after storm. No injuries but vehicles cannot pass. Needs clearance.",
     models.IncidentSeverity.low, models.IncidentStatus.verified, 0.015, 0.005, 6),
]


def seed_db(db: Session):
    if db.query(models.User).count() > 0:
        return  # already seeded

    users = []
    for phone, name, pw, role, lat, lng in DEMO_USERS:
        u = models.User(
            name=name, phone=phone, role=role,
            password_hash=hash_password(pw),
            lat=lat, lng=lng,
        )
        db.add(u)
        users.append(u)
    db.commit()
    for u in users:
        db.refresh(u)

    citizen = users[0]
    # Pick a few different reporters for realism
    reporters = [users[0], users[0], users[0], users[0], users[0], users[0], users[0]]
    now = datetime.utcnow()
    for (itype, desc, sev, status, dlat, dlng, hrs_ago), reporter in zip(SAMPLE_INCIDENTS, reporters):
        lat = KTM_LAT + dlat
        lng = KTM_LNG + dlng
        inc = models.Incident(
            reporter_id=reporter.id,
            incident_type=itype,
            description=desc,
            ai_summary=f"[{itype.title()}] {desc[:140]}",
            ai_priority=sev,
            ai_verified=True,
            lat=lat, lng=lng,
            severity=sev, status=status,
            created_at=now - timedelta(hours=hrs_ago),
            updated_at=now - timedelta(hours=hrs_ago),
            address=f"Kathmandu ({lat:.3f}, {lng:.3f})",
        )
        db.add(inc)
    db.commit()

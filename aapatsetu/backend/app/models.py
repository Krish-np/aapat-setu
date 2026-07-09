import enum
from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Float, DateTime, ForeignKey, Boolean, Text, Enum as SAEnum, JSON
)
from sqlalchemy.orm import relationship
from .database import Base


class UserRole(str, enum.Enum):
    citizen = "citizen"
    volunteer = "volunteer"
    responder = "responder"
    hospital = "hospital"
    police = "police"
    fire = "fire"
    ngo = "ngo"
    municipality = "municipality"
    admin = "admin"


class IncidentStatus(str, enum.Enum):
    submitted = "submitted"
    ai_processing = "ai_processing"
    verified = "verified"
    assigned = "assigned"
    dispatched = "dispatched"
    en_route = "en_route"
    on_site = "on_site"
    rescue_ongoing = "rescue_ongoing"
    resolved = "resolved"
    rejected = "rejected"


class IncidentSeverity(str, enum.Enum):
    low = "low"
    moderate = "moderate"
    high = "high"
    critical = "critical"


class TaskStatus(str, enum.Enum):
    pending = "pending"
    claimed = "claimed"
    en_route = "en_route"
    on_site = "on_site"
    in_progress = "in_progress"
    completed = "completed"


class TaskType(str, enum.Enum):
    rescue = "rescue"
    medical = "medical"
    fire = "fire"
    police = "police"
    shelter = "shelter"
    food = "food"
    water = "water"
    transport = "transport"
    other = "other"


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    phone = Column(String(20), unique=True, index=True, nullable=False)
    email = Column(String(120), nullable=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(SAEnum(UserRole), nullable=False, default=UserRole.citizen)
    organization = Column(String(200), nullable=True)
    skills = Column(JSON, nullable=True)  # for volunteers
    is_verified = Column(Boolean, default=False)
    availability = Column(String(30), default="available")  # available/busy/offline
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)
    capacity = Column(Integer, default=0)  # e.g. beds, trucks
    created_at = Column(DateTime, default=datetime.utcnow)

    incidents = relationship("Incident", back_populates="reporter", foreign_keys="Incident.reporter_id")
    tasks = relationship("Task", back_populates="assignee", foreign_keys="Task.assignee_id")


class Incident(Base):
    __tablename__ = "incidents"
    id = Column(Integer, primary_key=True, index=True)
    reporter_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    incident_type = Column(String(60), nullable=False)
    description = Column(Text, nullable=False)
    people_affected = Column(Integer, default=0)
    contact_number = Column(String(20), nullable=True)
    address = Column(String(255), nullable=True)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    photo_urls = Column(JSON, nullable=True)  # list of URLs
    voice_url = Column(String(500), nullable=True)
    voice_transcript = Column(Text, nullable=True)
    language = Column(String(10), default="en")

    # === AI fields ===
    ai_summary = Column(String(500), nullable=True)
    ai_summary_ne = Column(String(500), nullable=True)
    ai_severity = Column(SAEnum(IncidentSeverity), nullable=True)
    ai_confidence = Column(Float, default=0)
    ai_priority_score = Column(Float, default=0)
    ai_estimated_victims = Column(Integer, default=0)
    ai_response_time_min = Column(Integer, default=0)
    ai_rescue_difficulty = Column(String(20), default="medium")
    ai_risk_score = Column(Float, default=0)
    ai_risk_factors = Column(JSON, nullable=True)  # list of strings
    ai_required_resources = Column(JSON, nullable=True)  # list
    ai_suggested_responders = Column(JSON, nullable=True)  # list of role strings
    ai_safety_instructions = Column(Text, nullable=True)
    ai_safety_instructions_ne = Column(Text, nullable=True)
    ai_image_findings = Column(JSON, nullable=True)  # list from image analysis
    ai_damage_assessment = Column(String(20), default="minor")
    ai_duplicate_of = Column(Integer, ForeignKey("incidents.id"), nullable=True)
    ai_verified = Column(Boolean, default=False)
    ai_flag_reason = Column(String(255), nullable=True)
    ai_meta = Column(JSON, nullable=True)  # extra AI output

    # === Core fields ===
    severity = Column(SAEnum(IncidentSeverity), default=IncidentSeverity.moderate, nullable=False)
    status = Column(SAEnum(IncidentStatus), default=IncidentStatus.submitted, nullable=False)
    eta_minutes = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    reporter = relationship("User", back_populates="incidents", foreign_keys=[reporter_id])
    tasks = relationship("Task", back_populates="incident", cascade="all, delete-orphan")


class Task(Base):
    __tablename__ = "tasks"
    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(Integer, ForeignKey("incidents.id"), nullable=False)
    task_type = Column(SAEnum(TaskType), default=TaskType.rescue)
    assignee_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    assignee_role = Column(String(30), nullable=True)
    status = Column(SAEnum(TaskStatus), default=TaskStatus.pending, nullable=False)
    notes = Column(Text, nullable=True)
    resources_used = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    incident = relationship("Incident", back_populates="tasks")
    assignee = relationship("User", back_populates="tasks", foreign_keys=[assignee_id])


class StatusHistory(Base):
    __tablename__ = "status_history"
    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(Integer, ForeignKey("incidents.id"), nullable=False)
    from_status = Column(String(30), nullable=True)
    to_status = Column(String(30), nullable=False)
    note = Column(String(500), nullable=True)
    changed_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    incident_id = Column(Integer, ForeignKey("incidents.id"), nullable=True)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=True)
    kind = Column(String(30), default="info")  # info/alert/update/resolved
    read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class Alert(Base):
    __tablename__ = "alerts"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    title_ne = Column(String(200), nullable=True)
    message = Column(Text, nullable=False)
    message_ne = Column(Text, nullable=True)
    severity = Column(String(20), default="info")
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)
    radius_km = Column(Float, nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Resource(Base):
    __tablename__ = "resources"
    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    resource_type = Column(String(60), nullable=False)  # ambulance/firetruck/food/water/...
    name = Column(String(200), nullable=True)
    quantity = Column(Integer, default=1)
    available = Column(Boolean, default=True)
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class POI(Base):
    """Points of Interest: hospitals, police stations, fire stations, shelters."""
    __tablename__ = "pois"
    id = Column(Integer, primary_key=True, index=True)
    poi_type = Column(String(40), nullable=False)  # hospital/police/fire/shelter/safezone
    name = Column(String(200), nullable=False)
    address = Column(String(300), nullable=True)
    phone = Column(String(30), nullable=True)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    capacity = Column(Integer, default=0)
    available = Column(Integer, default=0)

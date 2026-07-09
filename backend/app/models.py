import enum
from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Float, DateTime, ForeignKey, Boolean, Text, Enum as SAEnum
)
from sqlalchemy.orm import relationship
from .database import Base


class UserRole(str, enum.Enum):
    citizen = "citizen"
    volunteer = "volunteer"
    responder = "responder"


class IncidentStatus(str, enum.Enum):
    reported = "reported"
    verified = "verified"
    assigned = "assigned"
    in_progress = "in_progress"
    resolved = "resolved"


class IncidentSeverity(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"


class TaskStatus(str, enum.Enum):
    pending = "pending"
    claimed = "claimed"
    in_progress = "in_progress"
    completed = "completed"


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    phone = Column(String(20), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(SAEnum(UserRole), nullable=False, default=UserRole.citizen)
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    incidents = relationship("Incident", back_populates="reporter", foreign_keys="Incident.reporter_id")
    tasks = relationship("Task", back_populates="volunteer", foreign_keys="Task.volunteer_id")


class Incident(Base):
    __tablename__ = "incidents"
    id = Column(Integer, primary_key=True, index=True)
    reporter_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    incident_type = Column(String(60), nullable=False)  # flood, fire, medical, accident, landslide, other
    description = Column(Text, nullable=False)
    ai_summary = Column(String(255), nullable=True)
    ai_priority = Column(SAEnum(IncidentSeverity), nullable=True)
    ai_verified = Column(Boolean, default=False)
    ai_flag_reason = Column(String(255), nullable=True)  # e.g. "spam", "vague", "duplicate"
    is_duplicate_of = Column(Integer, ForeignKey("incidents.id"), nullable=True)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    severity = Column(SAEnum(IncidentSeverity), default=IncidentSeverity.medium, nullable=False)
    status = Column(SAEnum(IncidentStatus), default=IncidentStatus.reported, nullable=False)
    photo_url = Column(String(500), nullable=True)
    address = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    reporter = relationship("User", back_populates="incidents", foreign_keys=[reporter_id])
    tasks = relationship("Task", back_populates="incident", cascade="all, delete-orphan")


class Task(Base):
    __tablename__ = "tasks"
    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(Integer, ForeignKey("incidents.id"), nullable=False)
    volunteer_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    status = Column(SAEnum(TaskStatus), default=TaskStatus.pending, nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    incident = relationship("Incident", back_populates="tasks")
    volunteer = relationship("User", back_populates="tasks", foreign_keys=[volunteer_id])


class StatusHistory(Base):
    __tablename__ = "status_history"
    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(Integer, ForeignKey("incidents.id"), nullable=False)
    from_status = Column(String(30), nullable=True)
    to_status = Column(String(30), nullable=False)
    note = Column(String(255), nullable=True)
    changed_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Alert(Base):
    __tablename__ = "alerts"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)
    radius_km = Column(Float, nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

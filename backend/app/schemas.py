from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict
from .models import UserRole, IncidentStatus, IncidentSeverity, TaskStatus


# ---------- Auth ----------
class UserCreate(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    phone: str = Field(min_length=4, max_length=20)
    password: str = Field(min_length=4, max_length=100)
    role: UserRole = UserRole.citizen
    lat: Optional[float] = None
    lng: Optional[float] = None


class UserLogin(BaseModel):
    phone: str
    password: str


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    phone: str
    role: UserRole
    lat: Optional[float] = None
    lng: Optional[float] = None


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ---------- Incident ----------
class IncidentCreate(BaseModel):
    incident_type: str
    description: str
    lat: float
    lng: float
    severity: Optional[IncidentSeverity] = None
    photo_url: Optional[str] = None
    address: Optional[str] = None


class IncidentUpdate(BaseModel):
    status: Optional[IncidentStatus] = None
    severity: Optional[IncidentSeverity] = None
    notes: Optional[str] = None


class StatusHistoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    from_status: Optional[str]
    to_status: str
    note: Optional[str]
    created_at: datetime


class ReporterBrief(BaseModel):
    id: int
    name: str
    phone: str


class IncidentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    reporter_id: int
    incident_type: str
    description: str
    ai_summary: Optional[str]
    ai_priority: Optional[IncidentSeverity]
    ai_verified: bool
    ai_flag_reason: Optional[str]
    is_duplicate_of: Optional[int]
    lat: float
    lng: float
    severity: IncidentSeverity
    status: IncidentStatus
    photo_url: Optional[str]
    address: Optional[str]
    created_at: datetime
    updated_at: datetime
    reporter: Optional[ReporterBrief] = None
    history: List[StatusHistoryOut] = []


# ---------- Task ----------
class TaskCreate(BaseModel):
    incident_id: int


class TaskUpdate(BaseModel):
    status: TaskStatus
    notes: Optional[str] = None


class VolunteerBrief(BaseModel):
    id: int
    name: str
    phone: str


class IncidentBrief(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    incident_type: str
    ai_summary: Optional[str]
    lat: float
    lng: float
    severity: IncidentSeverity
    status: IncidentStatus
    address: Optional[str]


class TaskOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    incident_id: int
    volunteer_id: Optional[int]
    status: TaskStatus
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime
    incident: Optional[IncidentBrief] = None
    volunteer: Optional[VolunteerBrief] = None


# ---------- Alert ----------
class AlertCreate(BaseModel):
    title: str
    message: str
    lat: Optional[float] = None
    lng: Optional[float] = None
    radius_km: Optional[float] = None


class AlertOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    title: str
    message: str
    lat: Optional[float]
    lng: Optional[float]
    radius_km: Optional[float]
    created_at: datetime

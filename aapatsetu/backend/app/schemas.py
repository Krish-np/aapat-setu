from datetime import datetime
from typing import Optional, List, Any
from pydantic import BaseModel, ConfigDict, Field
from .models import UserRole, IncidentStatus, IncidentSeverity, TaskStatus, TaskType


# ---------- Auth ----------
class UserCreate(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    phone: str = Field(min_length=4, max_length=20)
    email: Optional[str] = None
    password: str = Field(min_length=4, max_length=100)
    role: UserRole = UserRole.citizen
    organization: Optional[str] = None
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
    email: Optional[str] = None
    role: UserRole
    organization: Optional[str] = None
    is_verified: bool
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
    people_affected: int = 0
    contact_number: Optional[str] = None
    address: Optional[str] = None
    photo_urls: Optional[List[str]] = None
    voice_url: Optional[str] = None
    voice_transcript: Optional[str] = None
    language: Optional[str] = "en"


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


class TaskBrief(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    task_type: TaskType
    assignee_id: Optional[int]
    status: TaskStatus
    assignee_role: Optional[str]


class IncidentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    reporter_id: int
    incident_type: str
    description: str
    people_affected: int
    contact_number: Optional[str]
    ai_summary: Optional[str]
    ai_summary_ne: Optional[str]
    ai_severity: Optional[IncidentSeverity]
    ai_confidence: Optional[float]
    ai_priority_score: Optional[float]
    ai_estimated_victims: Optional[int]
    ai_response_time_min: Optional[int]
    ai_rescue_difficulty: Optional[str]
    ai_risk_score: Optional[float]
    ai_risk_factors: Optional[List[str]]
    ai_required_resources: Optional[List[str]]
    ai_suggested_responders: Optional[List[str]]
    ai_safety_instructions: Optional[str]
    ai_safety_instructions_ne: Optional[str]
    ai_image_findings: Optional[List[str]]
    ai_damage_assessment: Optional[str]
    ai_duplicate_of: Optional[int]
    ai_verified: bool
    ai_flag_reason: Optional[str]
    lat: float
    lng: float
    severity: IncidentSeverity
    status: IncidentStatus
    photo_urls: Optional[List[str]]
    address: Optional[str]
    eta_minutes: Optional[int]
    created_at: datetime
    updated_at: datetime
    reporter: Optional[ReporterBrief] = None
    history: List[StatusHistoryOut] = []
    tasks: List[TaskBrief] = []


# ---------- Task ----------
class TaskUpdate(BaseModel):
    status: TaskStatus
    notes: Optional[str] = None


class TaskOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    incident_id: int
    task_type: TaskType
    assignee_id: Optional[int]
    assignee_role: Optional[str]
    status: TaskStatus
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime


# ---------- Alert ----------
class AlertCreate(BaseModel):
    title: str
    message: str
    severity: str = "info"
    lat: Optional[float] = None
    lng: Optional[float] = None
    radius_km: Optional[float] = None


class AlertOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    title: str
    message: str
    severity: str
    created_at: datetime


# ---------- Notification ----------
class NotificationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    title: str
    message: Optional[str]
    kind: str
    read: bool
    created_at: datetime


# ---------- Resource ----------
class ResourceOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    resource_type: str
    name: Optional[str]
    quantity: int
    available: bool
    lat: Optional[float]
    lng: Optional[float]

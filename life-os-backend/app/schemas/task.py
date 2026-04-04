from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    source: str
    source_id: Optional[str] = None
    category: str
    deadline: Optional[datetime] = None
    estimated_duration_minutes: Optional[int] = None
    priority_base: float = 1.0
    is_college_related: bool = False
    is_mandatory: bool = False


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    status: Optional[str] = None
    deadline: Optional[datetime] = None
    estimated_duration_minutes: Optional[int] = None
    urgency_score: Optional[float] = None
    importance_score: Optional[float] = None
    risk_score: Optional[float] = None
    distress_score: Optional[float] = None
    completion_probability: Optional[float] = None
    is_college_related: Optional[bool] = None
    is_mandatory: Optional[bool] = None


class TaskResponse(BaseModel):
    id: int
    user_id: int
    title: str
    description: Optional[str]
    source: str
    source_id: Optional[str]
    category: str
    status: str
    deadline: Optional[datetime]
    estimated_duration_minutes: Optional[int]
    priority_base: float
    urgency_score: float
    importance_score: float
    risk_score: float
    distress_score: float
    completion_probability: float
    is_college_related: bool
    is_mandatory: bool

    model_config = ConfigDict(from_attributes=True)
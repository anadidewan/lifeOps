from datetime import time
from typing import Optional
from pydantic import BaseModel, ConfigDict


class UserCreate(BaseModel):
    firebase_uid: str
    email: str
    full_name: Optional[str] = None
    timezone: str = "America/Phoenix"
    wake_time: Optional[time] = None
    sleep_time: Optional[time] = None
    focus_block_minutes: int = 60
    break_minutes: int = 15
    academic_priority_weight: float = 1.2
    personal_priority_weight: float = 1.0


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    timezone: Optional[str] = None
    wake_time: Optional[time] = None
    sleep_time: Optional[time] = None
    focus_block_minutes: Optional[int] = None
    break_minutes: Optional[int] = None
    academic_priority_weight: Optional[float] = None
    personal_priority_weight: Optional[float] = None


class UserResponse(BaseModel):
    id: int
    firebase_uid: str
    email: str
    full_name: Optional[str]
    timezone: str
    wake_time: Optional[time]
    sleep_time: Optional[time]
    focus_block_minutes: int
    break_minutes: int
    academic_priority_weight: float
    personal_priority_weight: float

    model_config = ConfigDict(from_attributes=True)
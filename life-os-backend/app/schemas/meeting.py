from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class MeetingCreate(BaseModel):
    title: str
    description: Optional[str] = None
    source: str
    source_id: Optional[str] = None
    start_time: datetime
    end_time: datetime
    location: Optional[str] = None
    meeting_link: Optional[str] = None
    is_mandatory: bool = True
    is_college_related: bool = False


class MeetingUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    location: Optional[str] = None
    meeting_link: Optional[str] = None
    is_mandatory: Optional[bool] = None
    is_college_related: Optional[bool] = None


class MeetingResponse(BaseModel):
    id: int
    user_id: int
    title: str
    description: Optional[str]
    source: str
    source_id: Optional[str]
    start_time: datetime
    end_time: datetime
    location: Optional[str]
    meeting_link: Optional[str]
    is_mandatory: bool
    is_college_related: bool

    model_config = ConfigDict(from_attributes=True)
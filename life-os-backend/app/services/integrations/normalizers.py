from dataclasses import dataclass
from datetime import datetime
from typing import Optional


@dataclass
class NormalizedTask:
    title: str
    description: Optional[str]
    source: str
    source_id: Optional[str]
    category: str
    deadline: Optional[datetime]
    estimated_duration_minutes: Optional[int]
    is_college_related: bool
    is_mandatory: bool
    priority_base: float = 1.0


@dataclass
class NormalizedMeeting:
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
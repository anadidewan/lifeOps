from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class CompletionLogCreate(BaseModel):
    task_id: int
    planned_start: Optional[datetime] = None
    planned_end: Optional[datetime] = None
    actual_start: Optional[datetime] = None
    actual_end: Optional[datetime] = None
    completed_on_time: Optional[bool] = None
    skipped: bool = False
    rescheduled_count: int = 0


class CompletionLogResponse(BaseModel):
    id: int
    task_id: int
    planned_start: Optional[datetime]
    planned_end: Optional[datetime]
    actual_start: Optional[datetime]
    actual_end: Optional[datetime]
    completed_on_time: Optional[bool]
    skipped: bool
    rescheduled_count: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
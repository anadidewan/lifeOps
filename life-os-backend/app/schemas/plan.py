from datetime import date, datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict


class PlanBlockCreate(BaseModel):
    block_type: str
    title: str
    start_time: datetime
    end_time: datetime
    linked_task_id: Optional[int] = None
    linked_meeting_id: Optional[int] = None
    rationale: Optional[str] = None


class PlanCreate(BaseModel):
    plan_date: date
    status: str = "generated"
    summary: Optional[str] = None
    blocks: List[PlanBlockCreate] = []


class PlanBlockResponse(BaseModel):
    id: int
    plan_id: int
    block_type: str
    title: str
    start_time: datetime
    end_time: datetime
    linked_task_id: Optional[int]
    linked_meeting_id: Optional[int]
    rationale: Optional[str]

    model_config = ConfigDict(from_attributes=True)


class PlanResponse(BaseModel):
    id: int
    user_id: int
    plan_date: date
    status: str
    summary: Optional[str]
    blocks: List[PlanBlockResponse] = []

    model_config = ConfigDict(from_attributes=True)
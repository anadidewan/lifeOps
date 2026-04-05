from datetime import date, datetime
from typing import Optional, List
from pydantic import BaseModel


class RankedTaskResponse(BaseModel):
    task_id: int
    title: str
    category: str
    deadline: Optional[datetime]
    estimated_duration_minutes: Optional[int]

    urgency_score: float
    importance_score: float
    risk_score: float
    distress_score: float
    completion_probability: float

    final_score: float
    rationale: str


class PlannerMeetingResponse(BaseModel):
    meeting_id: int
    title: str
    start_time: datetime
    end_time: datetime
    is_mandatory: bool
    is_college_related: bool


class PlannerPreviewResponse(BaseModel):
    date: date
    ranked_tasks: List[RankedTaskResponse]
    meetings: List[PlannerMeetingResponse]


class TimeSlotResponse(BaseModel):
    start_time: datetime
    end_time: datetime
    duration_minutes: int


class ScheduledTaskBlockResponse(BaseModel):
    task_id: int
    title: str
    category: str
    start_time: datetime
    end_time: datetime
    duration_minutes: int
    final_score: float
    rationale: str


class UnscheduledTaskResponse(BaseModel):
    task_id: int
    title: str
    category: str
    estimated_duration_minutes: Optional[int]
    final_score: float
    reason: str


class GeneratedPlanResponse(BaseModel):
    date: date
    meetings: List[PlannerMeetingResponse]
    free_slots: List[TimeSlotResponse]
    scheduled_blocks: List[ScheduledTaskBlockResponse]
    unscheduled_tasks: List[UnscheduledTaskResponse]


class RiskInsightResponse(BaseModel):
    task_id: int
    title: str
    category: str
    deadline: Optional[datetime]
    estimated_duration_minutes: Optional[int]
    risk_score: float
    risk_reason: str


class LearningInsightResponse(BaseModel):
    task_id: int
    title: str
    category: str
    distress_score: float
    completion_probability: float
    estimated_duration_minutes: Optional[int]
    adjusted_duration_minutes: Optional[int]
from datetime import datetime, date, time, timedelta, timezone
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.task import Task
from app.models.meeting import Meeting
from app.repositories.task_repository import TaskRepository
from app.repositories.meeting_repository import MeetingRepository
from app.schemas.planner import (
    RankedTaskResponse,
    PlannerMeetingResponse,
    PlannerPreviewResponse,
    GeneratedPlanResponse,
)
from app.services.planner.scoring_service import ScoringService
from app.services.planner.scheduling_service import SchedulingService
from zoneinfo import ZoneInfo

class PlannerService:
    def __init__(self, db: Session):
        self.db = db
        self.task_repo = TaskRepository()
        self.meeting_repo = MeetingRepository()
        self.scoring_service = ScoringService()
        self.scheduling_service = SchedulingService()

    def _get_day_bounds(self, target_date: date):
        start_dt = datetime.combine(target_date, time.min).replace(tzinfo=timezone.utc)
        end_dt = datetime.combine(target_date, time.max).replace(tzinfo=timezone.utc)
        return start_dt, end_dt

    def _get_meetings_for_date(self, user_id: int, target_date: date) -> list[Meeting]:
        start_dt, end_dt = self._get_day_bounds(target_date)

        return (
            self.db.query(Meeting)
            .filter(
                Meeting.user_id == user_id,
                Meeting.start_time >= start_dt,
                Meeting.start_time <= end_dt,
            )
            .order_by(Meeting.start_time.asc())
            .all()
        )

    def _get_candidate_tasks(self, user_id: int, target_date: date) -> list[Task]:
        pending_tasks = self.task_repo.list_pending(self.db, user_id=user_id)

        # current MVP: include all pending tasks
        # later we can narrow to due-soon / high-value items only
        return pending_tasks

    def generate_day_plan(self, user: User, target_date: date) -> GeneratedPlanResponse:
        preview = self.preview_day(user, target_date)

        day_start, day_end = self.scheduling_service._get_user_day_window(
            target_date=target_date,
            user_timezone=user.timezone,
            wake_time=user.wake_time,
            sleep_time=user.sleep_time,
        )

        free_slots = self.scheduling_service._subtract_meetings_from_window(
            day_start=day_start,
            day_end=day_end,
            meetings=preview.meetings,
            user_timezone=user.timezone,
        )

        scheduled_blocks, unscheduled_tasks = self.scheduling_service.schedule_tasks_into_slots(
            ranked_tasks=preview.ranked_tasks,
            free_slots=free_slots,
            focus_block_minutes=user.focus_block_minutes,
            break_minutes=user.break_minutes,
        )

        return GeneratedPlanResponse(
            date=target_date,
            meetings=preview.meetings,
            free_slots=free_slots,
            scheduled_blocks=scheduled_blocks,
            unscheduled_tasks=unscheduled_tasks,
        )

    def preview_day(self, user: User, target_date: date) -> PlannerPreviewResponse:
        now = datetime.now(timezone.utc)

        tasks = self._get_candidate_tasks(user.id, target_date)
        meetings = self._get_meetings_for_date(user.id, target_date)

        ranked_tasks = []
        for task in tasks:
            final_score, parts = self.scoring_service.compute_final_score(task, user, now)
            rationale = self.scoring_service.build_rationale(task, parts, now, user.timezone)

            ranked_tasks.append(
                RankedTaskResponse(
                    task_id=task.id,
                    title=task.title,
                    category=task.category,
                    deadline=task.deadline,
                    estimated_duration_minutes=task.estimated_duration_minutes,
                    urgency_score=parts["urgency_score"],
                    importance_score=parts["importance_score"],
                    risk_score=parts["risk_score"],
                    distress_score=parts["distress_score"],
                    completion_probability=parts["completion_probability"],
                    final_score=final_score,
                    rationale=rationale,
                )
            )

        ranked_tasks.sort(key=lambda x: x.final_score, reverse=True)

        meeting_responses = [
            PlannerMeetingResponse(
                meeting_id=meeting.id,
                title=meeting.title,
                start_time=meeting.start_time,
                end_time=meeting.end_time,
                is_mandatory=meeting.is_mandatory,
                is_college_related=meeting.is_college_related,
            )
            for meeting in meetings
        ]

        return PlannerPreviewResponse(
            date=target_date,
            ranked_tasks=ranked_tasks,
            meetings=meeting_responses,
        )
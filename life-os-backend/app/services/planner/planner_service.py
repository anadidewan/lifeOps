from datetime import datetime, date, time, timezone
from zoneinfo import ZoneInfo

from sqlalchemy.orm import Session

from app.models.user import User
from app.models.task import Task
from app.models.meeting import Meeting

from app.repositories.task_repository import TaskRepository
from app.repositories.meeting_repository import MeetingRepository
from app.repositories.completion_log_repository import CompletionLogRepository
from app.repositories.plan_repository import PlanRepository

from app.schemas.planner import (
    RankedTaskResponse,
    PlannerMeetingResponse,
    PlannerPreviewResponse,
    GeneratedPlanResponse,
)
from app.schemas.plan import PlanCreate, PlanBlockCreate

from app.services.planner.scoring_service import ScoringService
from app.services.planner.scheduling_service import SchedulingService
from app.services.planner.filtering_service import FilteringService
from app.services.planner.risk_service import RiskService
from app.services.planner.learning_service import LearningService


class PlannerService:

    def __init__(self, db: Session):
        self.db = db

        self.task_repo = TaskRepository()
        self.meeting_repo = MeetingRepository()
        self.completion_log_repo = CompletionLogRepository()
        self.plan_repo = PlanRepository()

        self.scoring_service = ScoringService()
        self.scheduling_service = SchedulingService()
        self.filtering_service = FilteringService()
        self.risk_service = RiskService()
        self.learning_service = LearningService()

    # --------------------------------------------------
    # helpers
    # --------------------------------------------------

    def _get_day_bounds(self, target_date: date):

        start_dt = datetime.combine(target_date, time.min).replace(tzinfo=timezone.utc)
        end_dt = datetime.combine(target_date, time.max).replace(tzinfo=timezone.utc)

        return start_dt, end_dt


    def _get_meetings_for_date(
        self,
        user_id: int,
        target_date: date
    ) -> list[Meeting]:

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


    def _get_candidate_tasks(
        self,
        user_id: int,
        target_date: date
    ) -> list[Task]:

        pending_tasks = self.task_repo.list_pending(
            self.db,
            user_id=user_id,
        )

        return self.filtering_service.get_relevant_tasks(
            pending_tasks,
            horizon_days=7,
        )


    def _estimate_free_minutes_before_deadline(
        self,
        task: Task,
        target_date: date,
        user: User,
        meetings: list[Meeting],
    ) -> int | None:

        if task.deadline is None:
            return None

        day_start, day_end = self.scheduling_service._get_user_day_window(
            target_date=target_date,
            user_timezone=user.timezone,
            wake_time=user.wake_time,
            sleep_time=user.sleep_time,
        )

        user_tz = ZoneInfo(user.timezone)

        deadline_local = task.deadline.astimezone(user_tz)

        effective_end = min(day_end, deadline_local)

        if effective_end <= day_start:
            return 0

        total_minutes = int(
            (effective_end - day_start).total_seconds() / 60
        )

        busy_minutes = 0

        for meeting in meetings:

            meeting_start = meeting.start_time.astimezone(user_tz)
            meeting_end = meeting.end_time.astimezone(user_tz)

            overlap_start = max(day_start, meeting_start)
            overlap_end = min(effective_end, meeting_end)

            if overlap_end > overlap_start:

                busy_minutes += int(
                    (overlap_end - overlap_start).total_seconds() / 60
                )

        return max(total_minutes - busy_minutes, 0)


    # --------------------------------------------------
    # feature 1 helpers
    # --------------------------------------------------

    def _build_plan_create_from_generated(
        self,
        generated_plan: GeneratedPlanResponse,
    ) -> PlanCreate:

        blocks = []

        for meeting in generated_plan.meetings:

            blocks.append(
                PlanBlockCreate(
                    block_type="meeting",
                    title=meeting.title,
                    start_time=meeting.start_time,
                    end_time=meeting.end_time,
                    linked_task_id=None,
                    linked_meeting_id=meeting.meeting_id,
                    rationale="Fixed meeting",
                )
            )

        for block in generated_plan.scheduled_blocks:

            blocks.append(
                PlanBlockCreate(
                    block_type="deep_work",
                    title=block.title,
                    start_time=block.start_time,
                    end_time=block.end_time,
                    linked_task_id=block.task_id,
                    linked_meeting_id=None,
                    rationale=block.rationale,
                )
            )

        return PlanCreate(
            plan_date=generated_plan.date,
            status="generated",
            summary=f"Auto-generated plan for {generated_plan.date}",
            blocks=blocks,
        )


    # --------------------------------------------------
    # feature 1 public methods
    # --------------------------------------------------

    def generate_and_save_day_plan(
        self,
        user: User,
        target_date: date,
    ):

        generated = self.generate_day_plan(user, target_date)

        plan_in = self._build_plan_create_from_generated(
            generated
        )

        return self.plan_repo.replace_for_date(
            self.db,
            user_id=user.id,
            plan_in=plan_in,
        )


    def get_saved_plan(
        self,
        user: User,
        target_date: date,
    ):

        return self.plan_repo.get_by_date(
            self.db,
            user_id=user.id,
            plan_date=target_date,
        )


    # --------------------------------------------------
    # planner core
    # --------------------------------------------------

    def preview_day(
        self,
        user: User,
        target_date: date,
    ) -> PlannerPreviewResponse:

        now = datetime.now(timezone.utc)

        tasks = self._get_candidate_tasks(
            user.id,
            target_date,
        )

        meetings = self._get_meetings_for_date(
            user.id,
            target_date,
        )

        ranked_tasks = []

        for task in tasks:

            logs = self.completion_log_repo.list_for_task(
                self.db,
                task.id,
            )

            # learning signals

            task.distress_score = self.learning_service.compute_distress_score(logs)

            task.completion_probability = self.learning_service.compute_completion_probability(logs)

            adjusted_duration = self.learning_service.compute_adjusted_duration_minutes(
                task,
                logs,
            )

            if adjusted_duration is not None:
                task.estimated_duration_minutes = adjusted_duration

            # risk

            free_minutes_before_deadline = self._estimate_free_minutes_before_deadline(
                task,
                target_date,
                user,
                meetings,
            )

            risk_score, risk_reason = self.risk_service.compute_risk_score(
                task=task,
                free_minutes_before_deadline=free_minutes_before_deadline,
                logs=logs,
                now=now,
            )

            task.risk_score = risk_score

            # scoring

            final_score, parts = self.scoring_service.compute_final_score(
                task,
                user,
                now,
            )

            rationale = self.scoring_service.build_rationale(
                task,
                parts,
                now,
                user.timezone,
            )

            rationale = f"{rationale} | Risk: {risk_reason}"

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

        ranked_tasks.sort(
            key=lambda x: x.final_score,
            reverse=True,
        )

        meeting_responses = [

            PlannerMeetingResponse(
                meeting_id=m.id,
                title=m.title,
                start_time=m.start_time,
                end_time=m.end_time,
                is_mandatory=m.is_mandatory,
                is_college_related=m.is_college_related,
            )

            for m in meetings
        ]

        return PlannerPreviewResponse(

            date=target_date,

            ranked_tasks=ranked_tasks,

            meetings=meeting_responses,
        )


    def generate_day_plan(
        self,
        user: User,
        target_date: date,
    ) -> GeneratedPlanResponse:

        preview = self.preview_day(
            user,
            target_date,
        )

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
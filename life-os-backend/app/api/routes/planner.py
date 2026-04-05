from datetime import date, datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.auth import get_current_user_required
from app.models.user import User

from app.schemas.planner import (
    PlannerPreviewResponse,
    GeneratedPlanResponse,
    RiskInsightResponse,
    LearningInsightResponse,
)

from app.schemas.plan import PlanResponse

from app.services.planner.planner_service import PlannerService


router = APIRouter(prefix="/planner", tags=["planner"])


# -----------------------------
# existing endpoints
# -----------------------------

@router.get("/preview", response_model=PlannerPreviewResponse)
def preview_day_plan(
    target_date: date,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_required),
):
    planner_service = PlannerService(db)
    return planner_service.preview_day(current_user, target_date)


@router.get("/generate", response_model=GeneratedPlanResponse)
def generate_day_plan(
    target_date: date,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_required),
):
    planner_service = PlannerService(db)
    return planner_service.generate_day_plan(current_user, target_date)


# -----------------------------
# FEATURE 1
# plan persistence
# -----------------------------

@router.get("/saved", response_model=PlanResponse)
def get_saved_plan(
    target_date: date,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_required),
):
    planner_service = PlannerService(db)

    plan = planner_service.get_saved_plan(current_user, target_date)

    if not plan:
        raise HTTPException(
            status_code=404,
            detail="No saved plan exists for this date",
        )

    return plan


@router.post("/generate-and-save", response_model=PlanResponse)
def generate_and_save_plan(
    target_date: date,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_required),
):
    planner_service = PlannerService(db)

    return planner_service.generate_and_save_day_plan(
        current_user,
        target_date,
    )


# -----------------------------
# FEATURE 2
# risk insights
# -----------------------------

@router.get("/risk-insights", response_model=list[RiskInsightResponse])
def risk_insights(
    target_date: date,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_required),
):
    planner_service = PlannerService(db)

    tasks = planner_service._get_candidate_tasks(
        current_user.id,
        target_date,
    )

    meetings = planner_service._get_meetings_for_date(
        current_user.id,
        target_date,
    )

    now = datetime.now(timezone.utc)

    insights = []

    for task in tasks:

        logs = planner_service.completion_log_repo.list_for_task(
            db,
            task.id,
        )

        free_minutes = planner_service._estimate_free_minutes_before_deadline(
            task,
            target_date,
            current_user,
            meetings,
        )

        risk_score, risk_reason = planner_service.risk_service.compute_risk_score(
            task,
            free_minutes,
            logs,
            now,
        )

        insights.append(

            RiskInsightResponse(
                task_id=task.id,
                title=task.title,
                category=task.category,
                deadline=task.deadline,
                estimated_duration_minutes=task.estimated_duration_minutes,
                risk_score=risk_score,
                risk_reason=risk_reason,
            )
        )

    insights.sort(
        key=lambda x: x.risk_score,
        reverse=True,
    )

    return insights


# -----------------------------
# FEATURE 3
# learning insights
# -----------------------------

@router.get("/learning-insights", response_model=list[LearningInsightResponse])
def learning_insights(
    target_date: date,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_required),
):
    planner_service = PlannerService(db)

    tasks = planner_service._get_candidate_tasks(
        current_user.id,
        target_date,
    )

    insights = []

    for task in tasks:

        logs = planner_service.completion_log_repo.list_for_task(
            db,
            task.id,
        )

        distress_score = planner_service.learning_service.compute_distress_score(
            logs
        )

        completion_probability = planner_service.learning_service.compute_completion_probability(
            logs
        )

        adjusted_duration = planner_service.learning_service.compute_adjusted_duration_minutes(
            task,
            logs,
        )

        insights.append(

            LearningInsightResponse(
                task_id=task.id,
                title=task.title,
                category=task.category,
                distress_score=distress_score,
                completion_probability=completion_probability,
                estimated_duration_minutes=task.estimated_duration_minutes,
                adjusted_duration_minutes=adjusted_duration,
            )
        )

    insights.sort(
        key=lambda x: (x.distress_score, -x.completion_probability),
        reverse=True,
    )

    return insights
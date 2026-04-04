from datetime import date
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.auth import get_current_user_required
from app.models.user import User
from app.schemas.planner import PlannerPreviewResponse, GeneratedPlanResponse
from app.services.planner.planner_service import PlannerService

router = APIRouter(prefix="/planner", tags=["planner"])


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
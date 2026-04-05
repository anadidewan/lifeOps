from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.auth import get_current_user_required
from app.core.database import get_db
from app.models.user import User
from app.repositories.task_repository import TaskRepository
from app.repositories.completion_log_repository import CompletionLogRepository
from app.schemas.completion_log import CompletionLogCreate, CompletionLogResponse

router = APIRouter(prefix="/completion-logs", tags=["completion-logs"])

task_repo = TaskRepository()
completion_log_repo = CompletionLogRepository()


@router.post("", response_model=CompletionLogResponse)
def create_completion_log(
    payload: CompletionLogCreate,
    current_user: User = Depends(get_current_user_required),
    db: Session = Depends(get_db),
):
    task = task_repo.get_by_id(db, task_id=payload.task_id, user_id=current_user.id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    return completion_log_repo.create(db, payload)


@router.get("/task/{task_id}", response_model=list[CompletionLogResponse])
def list_task_completion_logs(
    task_id: int,
    current_user: User = Depends(get_current_user_required),
    db: Session = Depends(get_db),
):
    task = task_repo.get_by_id(db, task_id=task_id, user_id=current_user.id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    return completion_log_repo.list_for_task(db, task_id=task_id)
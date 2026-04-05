from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.auth import get_current_user_required
from app.core.database import get_db
from app.models.user import User

from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse
from app.schemas.task_actions import TaskRescheduleRequest
from app.schemas.completion_log import CompletionLogCreate, CompletionLogResponse

from app.repositories.task_repository import TaskRepository
from app.repositories.completion_log_repository import CompletionLogRepository

router = APIRouter(prefix="/tasks", tags=["tasks"])

repo = TaskRepository()
completion_log_repo = CompletionLogRepository()


@router.post("", response_model=TaskResponse)
def create_task(
    payload: TaskCreate,
    current_user: User = Depends(get_current_user_required),
    db: Session = Depends(get_db),
):
    return repo.create(db, user_id=current_user.id, task_in=payload)


@router.get("", response_model=list[TaskResponse])
def list_tasks(
    current_user: User = Depends(get_current_user_required),
    db: Session = Depends(get_db),
):
    return repo.list_all(db, user_id=current_user.id)


@router.patch("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: int,
    payload: TaskUpdate,
    current_user: User = Depends(get_current_user_required),
    db: Session = Depends(get_db),
):
    task = repo.get_by_id(db, task_id=task_id, user_id=current_user.id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    updated = repo.update(db, db_task=task, task_in=payload)
    return updated


@router.post("/{task_id}/complete", response_model=TaskResponse)
def mark_task_completed(
    task_id: int,
    current_user: User = Depends(get_current_user_required),
    db: Session = Depends(get_db),
):
    task = repo.get_by_id(db, task_id=task_id, user_id=current_user.id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    task.status = "completed"
    db.commit()
    db.refresh(task)
    return task


@router.post("/{task_id}/skip", response_model=TaskResponse)
def skip_task(
    task_id: int,
    current_user: User = Depends(get_current_user_required),
    db: Session = Depends(get_db),
):
    task = repo.get_by_id(db, task_id=task_id, user_id=current_user.id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    task.status = "skipped"
    db.commit()
    db.refresh(task)
    return task


@router.post("/{task_id}/reschedule", response_model=TaskResponse)
def reschedule_task(
    task_id: int,
    payload: TaskRescheduleRequest,
    current_user: User = Depends(get_current_user_required),
    db: Session = Depends(get_db),
):
    task = repo.get_by_id(db, task_id=task_id, user_id=current_user.id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    task.deadline = payload.new_deadline
    db.commit()
    db.refresh(task)
    return task


@router.post("/{task_id}/completion-log", response_model=CompletionLogResponse)
def create_task_completion_log(
    task_id: int,
    payload: CompletionLogCreate,
    current_user: User = Depends(get_current_user_required),
    db: Session = Depends(get_db),
):
    task = repo.get_by_id(db, task_id=task_id, user_id=current_user.id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    safe_payload = CompletionLogCreate(
        task_id=task_id,
        planned_start=payload.planned_start,
        planned_end=payload.planned_end,
        actual_start=payload.actual_start,
        actual_end=payload.actual_end,
        completed_on_time=payload.completed_on_time,
        skipped=payload.skipped,
        rescheduled_count=payload.rescheduled_count,
    )
    return completion_log_repo.create(db, safe_payload)
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.auth import get_current_user_required
from app.core.database import get_db
from app.models.user import User
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse
from app.repositories.task_repository import TaskRepository

router = APIRouter(prefix="/tasks", tags=["tasks"])
repo = TaskRepository()


@router.post("", response_model=TaskResponse)
def create_task(
    payload: TaskCreate,
    current_user: User = Depends(get_current_user_required),
    db: Session = Depends(get_db),
):
    return repo.create(db, user_id=current_user.id, payload=payload)


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
    return repo.update(db, task=task, payload=payload)
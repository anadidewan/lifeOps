from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse
from app.repositories.task_repository import TaskRepository

router = APIRouter(prefix="/tasks", tags=["tasks"])
repo = TaskRepository()

# temporary until auth exists
DUMMY_USER_ID = 1


@router.post("", response_model=TaskResponse)
def create_task(payload: TaskCreate, db: Session = Depends(get_db)):
    return repo.create(db, user_id=DUMMY_USER_ID, payload=payload)


@router.get("", response_model=list[TaskResponse])
def list_tasks(db: Session = Depends(get_db)):
    return repo.list_all(db, user_id=DUMMY_USER_ID)


@router.patch("/{task_id}", response_model=TaskResponse)
def update_task(task_id: int, payload: TaskUpdate, db: Session = Depends(get_db)):
    task = repo.get_by_id(db, task_id=task_id, user_id=DUMMY_USER_ID)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return repo.update(db, task=task, payload=payload)
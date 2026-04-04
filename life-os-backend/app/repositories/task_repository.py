from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.task import Task
from app.schemas.task import TaskCreate, TaskUpdate


class TaskRepository:
    def create(self, db: Session, user_id: int, payload: TaskCreate) -> Task:
        task = Task(user_id=user_id, **payload.model_dump())
        db.add(task)
        db.commit()
        db.refresh(task)
        return task

    def get_by_id(self, db: Session, task_id: int, user_id: int) -> Optional[Task]:
        return (
            db.query(Task)
            .filter(Task.id == task_id, Task.user_id == user_id)
            .first()
        )

    def list_all(self, db: Session, user_id: int) -> List[Task]:
        return (
            db.query(Task)
            .filter(Task.user_id == user_id)
            .order_by(Task.deadline.asc().nullslast())
            .all()
        )

    def list_pending(self, db: Session, user_id: int) -> List[Task]:
        return (
            db.query(Task)
            .filter(Task.user_id == user_id, Task.status == "pending")
            .order_by(Task.deadline.asc().nullslast())
            .all()
        )

    def update(self, db: Session, task: Task, payload: TaskUpdate) -> Task:
        for field, value in payload.model_dump(exclude_unset=True).items():
            setattr(task, field, value)
        db.commit()
        db.refresh(task)
        return task

    def delete(self, db: Session, task: Task) -> None:
        db.delete(task)
        db.commit()
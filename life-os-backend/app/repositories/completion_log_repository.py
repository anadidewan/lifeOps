from typing import List, Optional

from sqlalchemy.orm import Session

from app.models.completion_log import CompletionLog
from app.schemas.completion_log import CompletionLogCreate


class CompletionLogRepository:
    def create(self, db: Session, payload: CompletionLogCreate) -> CompletionLog:
        log = CompletionLog(**payload.model_dump())
        db.add(log)
        db.commit()
        db.refresh(log)
        return log

    def list_for_task(self, db: Session, task_id: int) -> List[CompletionLog]:
        return (
            db.query(CompletionLog)
            .filter(CompletionLog.task_id == task_id)
            .order_by(CompletionLog.created_at.desc())
            .all()
        )

    def latest_for_task(self, db: Session, task_id: int) -> Optional[CompletionLog]:
        return (
            db.query(CompletionLog)
            .filter(CompletionLog.task_id == task_id)
            .order_by(CompletionLog.created_at.desc())
            .first()
        )
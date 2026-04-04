from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.meeting import Meeting
from app.schemas.meeting import MeetingCreate, MeetingUpdate


class MeetingRepository:
    def create(self, db: Session, user_id: int, payload: MeetingCreate) -> Meeting:
        meeting = Meeting(user_id=user_id, **payload.model_dump())
        db.add(meeting)
        db.commit()
        db.refresh(meeting)
        return meeting

    def get_by_id(self, db: Session, meeting_id: int, user_id: int) -> Optional[Meeting]:
        return (
            db.query(Meeting)
            .filter(Meeting.id == meeting_id, Meeting.user_id == user_id)
            .first()
        )

    def list_all(self, db: Session, user_id: int) -> List[Meeting]:
        return (
            db.query(Meeting)
            .filter(Meeting.user_id == user_id)
            .order_by(Meeting.start_time.asc())
            .all()
        )

    def update(self, db: Session, meeting: Meeting, payload: MeetingUpdate) -> Meeting:
        for field, value in payload.model_dump(exclude_unset=True).items():
            setattr(meeting, field, value)
        db.commit()
        db.refresh(meeting)
        return meeting

    def delete(self, db: Session, meeting: Meeting) -> None:
        db.delete(meeting)
        db.commit()
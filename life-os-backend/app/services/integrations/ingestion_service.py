from sqlalchemy.orm import Session

from app.models.meeting import Meeting
from app.models.task import Task
from app.services.integrations.normalizers import NormalizedMeeting, NormalizedTask


class IngestionService:
    def upsert_task(self, db: Session, user_id: int, item: NormalizedTask) -> tuple[Task, str]:
        existing = (
            db.query(Task)
            .filter(
                Task.user_id == user_id,
                Task.source == item.source,
                Task.source_id == item.source_id,
            )
            .first()
        )

        if existing:
            existing.title = item.title
            existing.description = item.description
            existing.category = item.category
            existing.deadline = item.deadline
            existing.estimated_duration_minutes = item.estimated_duration_minutes
            existing.is_college_related = item.is_college_related
            existing.is_mandatory = item.is_mandatory
            existing.priority_base = item.priority_base
            db.commit()
            db.refresh(existing)
            return existing, "updated"

        task = Task(
            user_id=user_id,
            title=item.title,
            description=item.description,
            source=item.source,
            source_id=item.source_id,
            category=item.category,
            status="pending",
            deadline=item.deadline,
            estimated_duration_minutes=item.estimated_duration_minutes,
            priority_base=item.priority_base,
            is_college_related=item.is_college_related,
            is_mandatory=item.is_mandatory,
        )
        db.add(task)
        db.commit()
        db.refresh(task)
        return task, "created"

    def upsert_meeting(
        self,
        db: Session,
        user_id: int,
        item: NormalizedMeeting,
    ) -> tuple[Meeting, str]:
        existing = (
            db.query(Meeting)
            .filter(
                Meeting.user_id == user_id,
                Meeting.source == item.source,
                Meeting.source_id == item.source_id,
            )
            .first()
        )

        if existing:
            existing.title = item.title
            existing.description = item.description
            existing.start_time = item.start_time
            existing.end_time = item.end_time
            existing.location = item.location
            existing.meeting_link = item.meeting_link
            existing.is_mandatory = item.is_mandatory
            existing.is_college_related = item.is_college_related
            db.commit()
            db.refresh(existing)
            return existing, "updated"

        meeting = Meeting(
            user_id=user_id,
            title=item.title,
            description=item.description,
            source=item.source,
            source_id=item.source_id,
            start_time=item.start_time,
            end_time=item.end_time,
            location=item.location,
            meeting_link=item.meeting_link,
            is_mandatory=item.is_mandatory,
            is_college_related=item.is_college_related,
        )
        db.add(meeting)
        db.commit()
        db.refresh(meeting)
        return meeting, "created"
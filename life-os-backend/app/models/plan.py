from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from app.core.database import Base


class Plan(Base):
    __tablename__ = "plans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    plan_date = Column(Date, nullable=False, index=True)
    status = Column(String, nullable=False, default="generated")  # generated, adjusted, completed

    summary = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class PlanBlock(Base):
    __tablename__ = "plan_blocks"

    id = Column(Integer, primary_key=True, index=True)
    plan_id = Column(Integer, ForeignKey("plans.id"), nullable=False, index=True)

    block_type = Column(String, nullable=False)  # meeting, deep_work, admin, break
    title = Column(String, nullable=False)

    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=False)

    linked_task_id = Column(Integer, ForeignKey("tasks.id"), nullable=True)
    linked_meeting_id = Column(Integer, ForeignKey("meetings.id"), nullable=True)

    rationale = Column(Text, nullable=True)
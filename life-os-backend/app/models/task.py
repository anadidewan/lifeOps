from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float, Boolean, Text
from sqlalchemy.sql import func
from app.core.database import Base


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)

    source = Column(String, nullable=False)  # canvas, gmail, manual, inferred
    source_id = Column(String, nullable=True)  # external id from provider

    category = Column(String, nullable=False)  # assignment, exam_prep, email_action, personal
    status = Column(String, nullable=False, default="pending")  # pending, completed, skipped

    deadline = Column(DateTime(timezone=True), nullable=True)
    estimated_duration_minutes = Column(Integer, nullable=True)

    priority_base = Column(Float, nullable=False, default=1.0)
    urgency_score = Column(Float, nullable=False, default=0.0)
    importance_score = Column(Float, nullable=False, default=0.0)
    risk_score = Column(Float, nullable=False, default=0.0)
    distress_score = Column(Float, nullable=False, default=0.0)
    completion_probability = Column(Float, nullable=False, default=0.5)

    is_college_related = Column(Boolean, nullable=False, default=False)
    is_mandatory = Column(Boolean, nullable=False, default=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
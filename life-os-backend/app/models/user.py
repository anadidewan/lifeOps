from sqlalchemy import Column, Integer, String, Time, Float
from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    firebase_uid = Column(String, unique=True, nullable=False, index=True)

    email = Column(String, unique=True, nullable=False, index=True)
    full_name = Column(String, nullable=True)
    timezone = Column(String, nullable=False, default="America/Phoenix")

    wake_time = Column(Time, nullable=True)
    sleep_time = Column(Time, nullable=True)

    focus_block_minutes = Column(Integer, nullable=False, default=60)
    break_minutes = Column(Integer, nullable=False, default=15)

    academic_priority_weight = Column(Float, nullable=False, default=1.2)
    personal_priority_weight = Column(Float, nullable=False, default=1.0)
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, UniqueConstraint, Text
from sqlalchemy.sql import func
from app.core.database import Base


class Integration(Base):
    __tablename__ = "integrations"
    __table_args__ = (
        UniqueConstraint("user_id", "provider", name="uq_user_provider_integration"),
    )

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    provider = Column(String, nullable=False, index=True)  # "canvas", "gmail"
    is_active = Column(Boolean, default=True, nullable=False)
    status = Column(String, nullable=True) 
    access_token = Column(Text, nullable=True)
    refresh_token = Column(Text, nullable=True)
    #token_type = Column(String, nullable=True)
    #scope = Column(Text, nullable=True)
    #expires_at = Column(DateTime(timezone=True), nullable=True)

    #provider_account_id = Column(String, nullable=True)   # google sub
    #provider_email = Column(String, nullable=True)        # gmail address

    last_synced_at = Column(DateTime(timezone=True), nullable=True)
    # JSON array of Gmail message ids already processed by AI sync (dedupe / cost control)
    gmail_processed_message_ids = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
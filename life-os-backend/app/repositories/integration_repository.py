from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.integration import Integration
from app.schemas.integration import IntegrationCreate, IntegrationUpdate


class IntegrationRepository:
    def create(self, db: Session, user_id: int, payload: IntegrationCreate) -> Integration:
        integration = Integration(user_id=user_id, **payload.model_dump())
        db.add(integration)
        db.commit()
        db.refresh(integration)
        return integration

    def get_by_provider(self, db: Session, user_id: int, provider: str) -> Optional[Integration]:
        return (
            db.query(Integration)
            .filter(Integration.user_id == user_id, Integration.provider == provider)
            .first()
        )

    def list_all(self, db: Session, user_id: int) -> List[Integration]:
        return (
            db.query(Integration)
            .filter(Integration.user_id == user_id)
            .all()
        )

    def update(self, db: Session, integration: Integration, payload: IntegrationUpdate) -> Integration:
        for field, value in payload.model_dump(exclude_unset=True).items():
            setattr(integration, field, value)
        db.commit()
        db.refresh(integration)
        return integration
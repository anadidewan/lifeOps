from sqlalchemy.orm import Session

from app.models.integration import Integration
from app.schemas.integration import IntegrationCreate


def upsert_integration(
    db: Session,
    user_id: int,
    data: IntegrationCreate,
) -> Integration:

    integration = (
        db.query(Integration)
        .filter(
            Integration.user_id == user_id,
            Integration.provider == data.provider,
        )
        .first()
    )

    if integration:
        integration.access_token = (
            data.access_token.strip() if data.access_token else None
        )
        integration.refresh_token = data.refresh_token
        integration.status = data.status
        integration.is_active = data.is_active

    else:
        integration = Integration(
            user_id=user_id,
            provider=data.provider,
            access_token=(
                data.access_token.strip() if data.access_token else None
            ),
            refresh_token=data.refresh_token,
            status=data.status,
            is_active=data.is_active,
        )

        db.add(integration)

    db.commit()
    db.refresh(integration)

    return integration
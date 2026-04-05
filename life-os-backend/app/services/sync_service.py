from datetime import datetime, timezone
from typing import Literal

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.integration import Integration
from app.models.user import User
from app.schemas.integration import SyncResultResponse
from app.services.integrations.canvas_service import CanvasService
from app.services.integrations.gmail_service import GmailService
from app.services.integrations.ingestion_service import IngestionService


def run_provider_sync(
    db: Session,
    user: User,
    provider: Literal["canvas", "gmail"],
) -> SyncResultResponse:
    integration = (
        db.query(Integration)
        .filter(
            Integration.user_id == user.id,
            Integration.provider == provider,
            Integration.is_active.is_(True),
        )
        .first()
    )

    if not integration:
        raise HTTPException(
            status_code=404,
            detail=f"No active {provider} integration found",
        )

    provider_map = {
        "canvas": CanvasService,
        "gmail": GmailService,
    }

    provider_cls = provider_map.get(provider)
    if not provider_cls:
        raise HTTPException(status_code=400, detail="Unsupported provider")

    provider_service = provider_cls()
    ingestion_service = IngestionService()

    tasks_created = 0
    tasks_updated = 0
    meetings_created = 0
    meetings_updated = 0
    skipped = 0

    try:
        if provider == "gmail":
            result = provider_service.sync(integration, db)
        else:
            result = provider_service.sync(integration)
        skipped += int(result.get("skipped", 0))

        for item in result.get("tasks", []):
            _, status = ingestion_service.upsert_task(db, user.id, item)
            if status == "created":
                tasks_created += 1
            elif status == "updated":
                tasks_updated += 1
            else:
                skipped += 1

        for item in result.get("meetings", []):
            _, status = ingestion_service.upsert_meeting(db, user.id, item)
            if status == "created":
                meetings_created += 1
            elif status == "updated":
                meetings_updated += 1
            else:
                skipped += 1

        integration.last_synced_at = datetime.now(timezone.utc)
        db.commit()

    except Exception as e:
        db.rollback()
        raise Exception(f"{provider} sync failed: {str(e)}")

    return SyncResultResponse(
        provider=provider,
        tasks_created=tasks_created,
        tasks_updated=tasks_updated,
        meetings_created=meetings_created,
        meetings_updated=meetings_updated,
        skipped=skipped,
        status="success",
        detail=f"{provider} sync completed",
    )
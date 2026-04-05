from apscheduler.schedulers.asyncio import AsyncIOScheduler

from app.core.database import SessionLocal
from app.models.integration import Integration
from app.models.user import User
from app.services.sync_service import run_provider_sync

scheduler = AsyncIOScheduler()


def sync_all_provider_users(provider: str):
    db = SessionLocal()
    try:
        user_ids = [
            row[0]
            for row in db.query(User.id)
            .join(Integration, Integration.user_id == User.id)
            .filter(
                Integration.provider == provider,
                Integration.is_active.is_(True),
            )
            .all()
        ]
    finally:
        db.close()

    for user_id in user_ids:
        user_db = SessionLocal()
        try:
            user = user_db.query(User).filter(User.id == user_id).first()
            if user:
                result = run_provider_sync(
                    db=user_db,
                    user=user,
                    provider=provider,
                )
                print(
                    f"[{provider} sync] success user_id={user.id} "
                    f"tasks_created={result.tasks_created} "
                    f"tasks_updated={result.tasks_updated} "
                    f"meetings_created={result.meetings_created} "
                    f"meetings_updated={result.meetings_updated} "
                    f"skipped={result.skipped}"
                )
        except Exception as e:
            user_db.rollback()
            print(f"[{provider} sync] failed user_id={user_id}: {e}")
        finally:
            user_db.close()


def sync_all_canvas_users():
    sync_all_provider_users("canvas")


def sync_all_gmail_users():
    sync_all_provider_users("gmail")


def start_scheduler():
    scheduler.add_job(
        sync_all_canvas_users,
        trigger="interval",
        hours=1,
        id="canvas_hourly_sync",
        replace_existing=True,
    )

    scheduler.add_job(
        sync_all_gmail_users,
        trigger="interval",
        hours=1,
        id="gmail_hourly_sync",
        replace_existing=True,
    )

    scheduler.start()


def stop_scheduler():
    if scheduler.running:
        scheduler.shutdown()
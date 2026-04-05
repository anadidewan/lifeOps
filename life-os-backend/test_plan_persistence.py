from datetime import date
from app.core.database import SessionLocal
from app.services.planner.planner_service import PlannerService
from app.models.user import User

db = SessionLocal()

user = db.query(User).filter(User.id == 1).first()

if not user:
    print("No user found with id=1")

else:
    service = PlannerService(db)

    saved = service.generate_and_save_day_plan(user, date(2026, 4, 4))

    print("Saved plan ID:", saved.id)
    print("Saved plan date:", saved.plan_date)

    fetched = service.get_saved_plan(user, date(2026, 4, 4))

    print("Fetched plan ID:", fetched.id if fetched else None)
    print("Block count:", len(fetched.blocks) if fetched else 0)

db.close()

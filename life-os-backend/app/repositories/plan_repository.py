from datetime import date
from sqlalchemy.orm import Session

from app.models.plan import Plan, PlanBlock
from app.schemas.plan import PlanCreate


class PlanRepository:
    def create(self, db: Session, user_id: int, plan_in: PlanCreate) -> Plan:
        plan = Plan(
            user_id=user_id,
            plan_date=plan_in.plan_date,
            status=plan_in.status,
            summary=plan_in.summary,
        )
        db.add(plan)
        db.flush()

        for block in plan_in.blocks:
            db_block = PlanBlock(
                plan_id=plan.id,
                block_type=block.block_type,
                title=block.title,
                start_time=block.start_time,
                end_time=block.end_time,
                linked_task_id=block.linked_task_id,
                linked_meeting_id=block.linked_meeting_id,
                rationale=block.rationale,
            )
            db.add(db_block)

        db.commit()
        db.refresh(plan)
        return plan

    def get_by_date(self, db: Session, user_id: int, plan_date: date):
        return (
            db.query(Plan)
            .filter(Plan.user_id == user_id, Plan.plan_date == plan_date)
            .first()
        )

    def delete_by_date(self, db: Session, user_id: int, plan_date: date) -> bool:
        existing = self.get_by_date(db, user_id=user_id, plan_date=plan_date)

        if not existing:
            return False

        # delete child blocks first
        db.query(PlanBlock).filter(PlanBlock.plan_id == existing.id).delete()

        # then delete the plan
        db.delete(existing)

        db.commit()

        return True

    def replace_for_date(self, db: Session, user_id: int, plan_in: PlanCreate) -> Plan:
        self.delete_by_date(db, user_id=user_id, plan_date=plan_in.plan_date)
        return self.create(db, user_id=user_id, plan_in=plan_in)

    def list_all(self, db: Session, user_id: int):
        return (
            db.query(Plan)
            .filter(Plan.user_id == user_id)
            .order_by(Plan.plan_date.desc())
            .all()
        )
from typing import Optional, List
from datetime import date
from sqlalchemy.orm import Session
from app.models.plan import Plan, PlanBlock
from app.schemas.plan import PlanCreate


class PlanRepository:
    def create(self, db: Session, user_id: int, payload: PlanCreate) -> Plan:
        plan = Plan(
            user_id=user_id,
            plan_date=payload.plan_date,
            status=payload.status,
            summary=payload.summary,
        )
        db.add(plan)
        db.flush()

        for block_payload in payload.blocks:
            block = PlanBlock(
                plan_id=plan.id,
                block_type=block_payload.block_type,
                title=block_payload.title,
                start_time=block_payload.start_time,
                end_time=block_payload.end_time,
                linked_task_id=block_payload.linked_task_id,
                linked_meeting_id=block_payload.linked_meeting_id,
                rationale=block_payload.rationale,
            )
            db.add(block)

        db.commit()
        db.refresh(plan)
        return plan

    def get_by_date(self, db: Session, user_id: int, plan_date: date) -> Optional[Plan]:
        return (
            db.query(Plan)
            .filter(Plan.user_id == user_id, Plan.plan_date == plan_date)
            .first()
        )

    def list_all(self, db: Session, user_id: int) -> List[Plan]:
        return (
            db.query(Plan)
            .filter(Plan.user_id == user_id)
            .order_by(Plan.plan_date.desc())
            .all()
        )

    def get_blocks(self, db: Session, plan_id: int) -> List[PlanBlock]:
        return (
            db.query(PlanBlock)
            .filter(PlanBlock.plan_id == plan_id)
            .order_by(PlanBlock.start_time.asc())
            .all()
        )
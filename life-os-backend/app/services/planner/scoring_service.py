from datetime import datetime, timezone
from app.models.task import Task
from app.models.user import User
from zoneinfo import ZoneInfo


class ScoringService:
    def compute_urgency_score(self, task: Task, now: datetime) -> float:
        if not task.deadline:
            return 0.2

        deadline = task.deadline
        if deadline.tzinfo is None:
            deadline = deadline.replace(tzinfo=timezone.utc)
        if now.tzinfo is None:
            now = now.replace(tzinfo=timezone.utc)

        hours_left = (deadline - now).total_seconds() / 3600

        if hours_left <= 0:
            return 1.0
        if hours_left <= 6:
            return 0.95
        if hours_left <= 12:
            return 0.85
        if hours_left <= 24:
            return 0.75
        if hours_left <= 48:
            return 0.60
        if hours_left <= 72:
            return 0.45
        return 0.25

    def compute_importance_score(self, task: Task, user: User) -> float:
        score = task.priority_base

        if task.is_college_related:
            score += 0.35 * user.academic_priority_weight

        if task.is_mandatory:
            score += 0.25

        category_boosts = {
            "assignment": 0.30,
            "exam_prep": 0.35,
            "meeting_prep": 0.20,
            "email_action": 0.10,
            "personal": 0.00,
        }

        score += category_boosts.get(task.category, 0.05)
        return min(score, 1.5)

    def compute_risk_score(self, task: Task) -> float:
        return float(task.risk_score or 0.0)

    def compute_distress_score(self, task: Task) -> float:
        return float(task.distress_score or 0.0)

    def compute_completion_probability(self, task: Task) -> float:
        return float(task.completion_probability or 0.5)

    def compute_final_score(self, task: Task, user: User, now: datetime) -> tuple[float, dict]:
        urgency = self.compute_urgency_score(task, now)
        importance = self.compute_importance_score(task, user)
        risk = self.compute_risk_score(task)
        distress = self.compute_distress_score(task)
        completion_prob = self.compute_completion_probability(task)

        final_score = (
            0.35 * urgency +
            0.30 * importance +
            0.20 * risk +
            0.10 * distress +
            0.05 * completion_prob
        )

        return round(final_score, 4), {
            "urgency_score": round(urgency, 4),
            "importance_score": round(importance, 4),
            "risk_score": round(risk, 4),
            "distress_score": round(distress, 4),
            "completion_probability": round(completion_prob, 4),
        }
    def build_rationale(self, task: Task, score_parts: dict, now: datetime, user_tz: str) -> str:
        reasons = []

        tz = ZoneInfo(user_tz)

        now_local = now.astimezone(tz)

        deadline_local = None
        if task.deadline:
            deadline_local = task.deadline.astimezone(tz)

        if deadline_local:
            if deadline_local < now_local:
                reasons.append("is overdue")
            else:
                reasons.append("has a deadline")

        if task.is_college_related:
            reasons.append("is college-related")

        if task.is_mandatory:
            reasons.append("is mandatory")

        if (
            deadline_local
            and deadline_local >= now_local
            and score_parts["urgency_score"] >= 0.75
        ):
            reasons.append("is due soon")

        if score_parts["risk_score"] >= 0.7:
            reasons.append("has elevated miss risk")

        if score_parts["distress_score"] >= 0.7:
            reasons.append("has historically been hard to complete")

        if not reasons:
            reasons.append("is still pending and worth scheduling")

        return ", ".join(reasons)
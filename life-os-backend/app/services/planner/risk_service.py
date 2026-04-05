from datetime import datetime, timezone

from app.models.task import Task
from app.models.completion_log import CompletionLog


class RiskService:
    @staticmethod
    def _clamp(value: float, low: float = 0.0, high: float = 1.0) -> float:
        return max(low, min(high, value))

    def compute_overdue_risk(self, task: Task, now: datetime) -> float:
        if task.deadline and task.deadline < now:
            return 1.0
        return 0.0

    def compute_time_pressure_risk(
        self,
        task: Task,
        free_minutes_before_deadline: int | None,
    ) -> float:
        if task.deadline is None:
            return 0.0

        needed = task.estimated_duration_minutes or 60

        if free_minutes_before_deadline is None:
            return 0.2

        if free_minutes_before_deadline <= 0:
            return 1.0

        ratio = needed / max(free_minutes_before_deadline, 1)

        if ratio >= 1.25:
            return 1.0
        if ratio >= 1.0:
            return 0.9
        if ratio >= 0.75:
            return 0.7
        if ratio >= 0.5:
            return 0.45
        return 0.2

    def compute_history_risk(self, logs: list[CompletionLog]) -> float:
        if not logs:
            return 0.0

        skipped = sum(1 for log in logs if log.skipped)
        late = sum(
            1 for log in logs
            if (log.completed_on_time is False) and not log.skipped
        )
        rescheduled = sum(log.rescheduled_count for log in logs)

        skip_rate = skipped / len(logs)
        late_rate = late / len(logs)
        reschedule_factor = min(rescheduled / max(len(logs) * 2, 1), 1.0)

        raw = (0.5 * skip_rate) + (0.3 * late_rate) + (0.2 * reschedule_factor)
        return self._clamp(raw)

    def compute_size_risk(self, task: Task) -> float:
        duration = task.estimated_duration_minutes or 0

        if duration >= 240:
            return 0.7
        if duration >= 180:
            return 0.5
        if duration >= 120:
            return 0.3
        return 0.1

    def compute_risk_score(
        self,
        task: Task,
        free_minutes_before_deadline: int | None,
        logs: list[CompletionLog],
        now: datetime | None = None,
    ) -> tuple[float, str]:
        now = now or datetime.now(timezone.utc)

        overdue_risk = self.compute_overdue_risk(task, now)
        time_risk = self.compute_time_pressure_risk(task, free_minutes_before_deadline)
        history_risk = self.compute_history_risk(logs)
        size_risk = self.compute_size_risk(task)

        score = self._clamp(
            (0.4 * overdue_risk) +
            (0.3 * time_risk) +
            (0.2 * history_risk) +
            (0.1 * size_risk)
        )

        if overdue_risk >= 1.0:
            reason = "Overdue task with immediate miss risk."
        elif time_risk >= 0.9:
            reason = "Not enough free time before the deadline."
        elif history_risk >= 0.5:
            reason = "Past skips, lateness, or reschedules increase miss risk."
        elif size_risk >= 0.5:
            reason = "Large task size increases risk."
        else:
            reason = "Low-to-moderate risk."

        return score, reason
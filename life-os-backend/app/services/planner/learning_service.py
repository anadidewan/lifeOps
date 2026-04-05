from statistics import mean

from app.models.completion_log import CompletionLog
from app.models.task import Task


class LearningService:
    @staticmethod
    def _clamp(value: float, low: float = 0.0, high: float = 1.0) -> float:
        return max(low, min(high, value))

    def compute_distress_score(self, logs: list[CompletionLog]) -> float:
        """
        Distress represents historical friction / avoidance.
        Higher when user skips often, finishes late, or reschedules repeatedly.
        """
        if not logs:
            return 0.0

        skip_rate = sum(1 for log in logs if log.skipped) / len(logs)

        late_rate = sum(
            1 for log in logs
            if (log.completed_on_time is False) and not log.skipped
        ) / len(logs)

        avg_reschedules = sum(log.rescheduled_count for log in logs) / len(logs)
        reschedule_factor = min(avg_reschedules / 3.0, 1.0)

        raw = (0.5 * skip_rate) + (0.3 * late_rate) + (0.2 * reschedule_factor)
        return self._clamp(raw)

    def compute_completion_probability(self, logs: list[CompletionLog]) -> float:
        """
        Probability that a user will successfully complete this task type on time,
        based on historical outcomes.
        """
        if not logs:
            return 0.5

        on_time = sum(
            1 for log in logs
            if (log.completed_on_time is True) and not log.skipped
        )

        completed_but_late = sum(
            1 for log in logs
            if (log.completed_on_time is False) and not log.skipped
        )

        skipped = sum(1 for log in logs if log.skipped)

        score = (
            (1.0 * on_time) +
            (0.5 * completed_but_late) +
            (0.0 * skipped)
        ) / len(logs)

        return self._clamp(score, low=0.1, high=0.95)

    def compute_duration_multiplier(
        self,
        task: Task,
        logs: list[CompletionLog],
    ) -> float:
        """
        Estimate whether historical actual durations are longer than expected.
        Returns a multiplier for estimated_duration_minutes.
        """
        if not task.estimated_duration_minutes:
            return 1.0

        ratios: list[float] = []

        for log in logs:
            if log.actual_start and log.actual_end:
                actual_minutes = int(
                    (log.actual_end - log.actual_start).total_seconds() / 60
                )
                if actual_minutes > 0:
                    ratios.append(actual_minutes / max(task.estimated_duration_minutes, 1))

        if not ratios:
            return 1.0

        return max(1.0, min(2.0, mean(ratios)))

    def compute_adjusted_duration_minutes(
        self,
        task: Task,
        logs: list[CompletionLog],
    ) -> int | None:
        """
        Returns a learned duration estimate for planner use,
        without persisting it yet.
        """
        if not task.estimated_duration_minutes:
            return None

        multiplier = self.compute_duration_multiplier(task, logs)
        return int(task.estimated_duration_minutes * multiplier)
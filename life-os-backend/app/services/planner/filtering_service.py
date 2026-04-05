from datetime import datetime, timedelta, timezone

from app.models.task import Task


class FilteringService:
    def get_relevant_tasks(
        self,
        tasks: list[Task],
        horizon_days: int = 7,
    ) -> list[Task]:
        """
        Additive filter layer:
        - overdue tasks
        - tasks due within the horizon
        - high-priority tasks (priority_base >= 1.3)
        - tasks without deadline only if priority_base is elevated
        """
        now = datetime.now(timezone.utc)
        horizon = now + timedelta(days=horizon_days)

        relevant: list[Task] = []
        seen_ids: set[int] = set()

        for task in tasks:
            include = False

            if task.status != "pending":
                continue

            if task.deadline is not None and task.deadline < now:
                include = True
            elif task.deadline is not None and task.deadline <= horizon:
                include = True
            elif (task.priority_base or 1.0) >= 1.3:
                include = True

            if include and task.id not in seen_ids:
                relevant.append(task)
                seen_ids.add(task.id)

        return relevant
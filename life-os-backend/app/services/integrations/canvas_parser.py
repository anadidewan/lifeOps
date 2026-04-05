from datetime import datetime
from typing import Any

from app.services.integrations.normalizers import NormalizedTask, NormalizedMeeting


def _parse_dt(value: str | None):
    if not value:
        return None
    try:
        return datetime.fromisoformat(value.replace("Z", "+00:00"))
    except Exception:
        return None


class CanvasParser:
    def parse_todo_items(self, todo_items: list[dict[str, Any]]) -> list[NormalizedTask]:
        tasks: list[NormalizedTask] = []

        for item in todo_items:
            assignment = item.get("assignment") or {}
            title = (
                assignment.get("name")
                or item.get("assignment_name")
                or item.get("title")
                or "Canvas To-Do"
            )

            description = assignment.get("description") or item.get("description")
            source_id = assignment.get("id") or item.get("assignment_id") or item.get("id")
            deadline = _parse_dt(
                assignment.get("due_at")
                or item.get("due_at")
                or item.get("assignment", {}).get("due_at")
            )

            tasks.append(
                NormalizedTask(
                    title=title,
                    description=description,
                    source="canvas",
                    source_id=str(source_id) if source_id is not None else None,
                    category="assignment",
                    deadline=deadline,
                    estimated_duration_minutes=90,
                    is_college_related=True,
                    is_mandatory=True,
                    priority_base=1.2,
                )
            )

        return tasks

    def parse_assignment_deadlines(
        self,
        assignments: list[dict[str, Any]],
    ) -> list[NormalizedTask]:
        tasks: list[NormalizedTask] = []

        for item in assignments:
            due_at = _parse_dt(item.get("due_at"))
            if due_at is None:
                continue

            tasks.append(
                NormalizedTask(
                    title=item.get("name", "Canvas Assignment"),
                    description=item.get("description"),
                    source="canvas",
                    source_id=str(item.get("id")) if item.get("id") is not None else None,
                    category="assignment",
                    deadline=due_at,
                    estimated_duration_minutes=90,
                    is_college_related=True,
                    is_mandatory=True,
                    priority_base=1.2,
                )
            )

        return tasks

    def parse_calendar_events(
        self,
        events: list[dict[str, Any]],
    ) -> list[NormalizedMeeting]:
        meetings: list[NormalizedMeeting] = []

        for event in events:
            start_time = _parse_dt(event.get("start_at") or event.get("start_time"))
            end_time = _parse_dt(event.get("end_at") or event.get("end_time"))

            if not start_time or not end_time:
                continue

            meetings.append(
                NormalizedMeeting(
                    title=event.get("title", "Canvas Event"),
                    description=event.get("description"),
                    source="canvas",
                    source_id=str(event.get("id")) if event.get("id") is not None else None,
                    start_time=start_time,
                    end_time=end_time,
                    location=event.get("location_name") or event.get("location_address"),
                    meeting_link=event.get("html_url"),
                    is_mandatory=True,
                    is_college_related=True,
                )
            )

        return meetings
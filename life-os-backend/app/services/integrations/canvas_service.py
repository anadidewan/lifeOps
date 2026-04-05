import logging
from datetime import datetime, timedelta, timezone

from app.core.config import settings
from app.services.integrations.canvas_client import CanvasAPIError, CanvasClient
from app.services.integrations.canvas_parser import CanvasParser
from app.services.integrations.normalizers import NormalizedTask

logger = logging.getLogger(__name__)

# Only ingest assignments with a due date in [today, today + N weeks] (not all open items).
CANVAS_TASK_DUE_WINDOW_WEEKS = 3


def _utc_date(dt: datetime) -> datetime:
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


def filter_tasks_due_within_weeks(
    tasks: list[NormalizedTask],
    weeks: int = CANVAS_TASK_DUE_WINDOW_WEEKS,
) -> list[NormalizedTask]:
    """Keep tasks with a deadline between start of today (UTC) and end of the N-week window."""
    if weeks <= 0:
        return [t for t in tasks if t.deadline is not None]
    today = datetime.now(timezone.utc).date()
    last_day = today + timedelta(weeks=weeks)
    out: list[NormalizedTask] = []
    for t in tasks:
        if t.deadline is None:
            continue
        d = _utc_date(t.deadline).date()
        if today <= d <= last_day:
            out.append(t)
    return out


class CanvasService:
    def __init__(self):
        self.parser = CanvasParser()

    def _base_url(self, integration) -> str:
        """Use server CANVAS_BASE_URL from env (must match the school where the token was issued)."""
        raw = getattr(integration, "canvas_base_url", None) or settings.CANVAS_BASE_URL
        return raw.rstrip("/") + "/"

    def sync(self, integration) -> dict:
        token = (integration.access_token or "").strip()
        if not token:
            logger.warning("Canvas sync skipped: no access_token on integration")
            return {"tasks": [], "meetings": []}

        base_url = self._base_url(integration)
        client = CanvasClient(base_url=base_url, access_token=token)

        today = datetime.now(timezone.utc).date()
        horizon = today + timedelta(weeks=CANVAS_TASK_DUE_WINDOW_WEEKS)
        start_s = today.isoformat()
        end_s = horizon.isoformat()

        todo_items: list = []
        try:
            raw = client.get_todo()
            todo_items = raw if isinstance(raw, list) else []
        except CanvasAPIError as e:
            logger.warning("Canvas GET /users/self/todo failed (will try planner): %s", e)

        planner_items: list = []
        try:
            raw_p = client.get_planner_items(start_s, end_s)
            planner_items = raw_p if isinstance(raw_p, list) else []
        except CanvasAPIError as e:
            logger.warning("Canvas GET /planner/items failed: %s", e)

        merged_rows: list = []
        seen_ids: set[str] = set()
        for row in todo_items + planner_items:
            if not isinstance(row, dict):
                continue
            aid = (
                row.get("plannable_id")
                or (row.get("assignment") or {}).get("id")
                or row.get("assignment_id")
                or row.get("id")
            )
            key = str(aid) if aid is not None else None
            if key and key in seen_ids:
                continue
            if key:
                seen_ids.add(key)
            merged_rows.append(row)

        tasks = self.parser.parse_todo_items(merged_rows)

        calendar_events: list = []
        try:
            raw_c = client.get_calendar_events(start_s, end_s)
            calendar_events = raw_c if isinstance(raw_c, list) else []
        except CanvasAPIError as e:
            logger.warning("Canvas GET /calendar_events failed: %s", e)

        meetings = self.parser.parse_calendar_events(calendar_events)

        courses: list = []
        try:
            raw_co = client.get_courses()
            courses = raw_co if isinstance(raw_co, list) else []
        except CanvasAPIError as e:
            logger.warning("Canvas GET /courses failed: %s", e)

        for course in courses:
            course_id = course.get("id")
            if course_id is None:
                continue
            try:
                assignments = client.get_course_assignment_deadlines(course_id)
                if not isinstance(assignments, list):
                    continue
                tasks.extend(self.parser.parse_assignment_deadlines(assignments))
            except CanvasAPIError:
                continue

        dedup: dict[str, NormalizedTask] = {}
        for t in tasks:
            sid = t.source_id or f"anon-{len(dedup)}"
            dedup[str(sid)] = t
        tasks = list(dedup.values())

        tasks = filter_tasks_due_within_weeks(tasks)

        return {
            "tasks": tasks,
            "meetings": meetings,
        }

from app.services.integrations.canvas_client import CanvasClient
from app.services.integrations.canvas_parser import CanvasParser


class CanvasService:
    def __init__(self):
        self.parser = CanvasParser()

    def _get_base_url(self, integration) -> str:
        """
        Put your Canvas instance base URL here or derive it from integration metadata later.
        Example: https://asu.instructure.com
        """
        return "https://canvas.asu.edu/"

    def sync(self, integration) -> dict:
        base_url = self._get_base_url(integration)
        client = CanvasClient(
            base_url=base_url,
            access_token=integration.access_token,
        )

        todo_items = client.get_todo()
        calendar_events = client.get_calendar_events()
        courses = client.get_courses()

        tasks = self.parser.parse_todo_items(todo_items)
        meetings = self.parser.parse_calendar_events(calendar_events)

        # Optional: also pull assignment deadlines from each course
        for course in courses:
            course_id = course.get("id")
            if course_id is None:
                continue

            try:
                assignments = client.get_course_assignment_deadlines(course_id)
                tasks.extend(self.parser.parse_assignment_deadlines(assignments))
            except Exception:
                # keep sync resilient even if one course fails
                continue

        return {
            "tasks": tasks,
            "meetings": meetings,
        }
import requests


class CanvasAPIError(Exception):
    pass


class CanvasClient:
    def __init__(self, base_url: str, access_token: str):
        self.base_url = base_url.rstrip("/")
        self.access_token = access_token

    @property
    def headers(self) -> dict[str, str]:
        return {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json",
        }

    def get(self, path: str, params: dict | None = None):
        url = f"{self.base_url}{path}"
        response = requests.get(url, headers=self.headers, params=params, timeout=30)

        if not response.ok:
            raise CanvasAPIError(
                f"Canvas API error {response.status_code}: {response.text}"
            )

        return response.json()

    def get_courses(self):
        return self.get("/api/v1/courses", {"enrollment_state": "active"})

    def get_todo(self):
        return self.get("/api/v1/users/self/todo")

    def get_calendar_events(
        self,
        start_date: str | None = None,
        end_date: str | None = None,
    ):
        params: dict | None = None
        if start_date or end_date:
            params = {}
            if start_date:
                params["start_date"] = start_date
            if end_date:
                params["end_date"] = end_date
        return self.get("/api/v1/calendar_events", params)

    def get_planner_items(self, start_date: str, end_date: str):
        return self.get(
            "/api/v1/planner/items",
            {"start_date": start_date, "end_date": end_date},
        )

    def get_course_assignment_deadlines(self, course_id: int):
        return self.get(
            f"/api/v1/courses/{course_id}/assignments",
            {"order_by": "due_at"},
        )
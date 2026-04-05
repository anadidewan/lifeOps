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

    def get_calendar_events(self):
        return self.get("/api/v1/calendar_events")

    def get_course_assignment_deadlines(self, course_id: int):
        return self.get(
            f"/api/v1/courses/{course_id}/assignments",
            {"order_by": "due_at"},
        )
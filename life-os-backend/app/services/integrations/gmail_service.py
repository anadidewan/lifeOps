from datetime import datetime, timedelta
from typing import Any, Optional, List

import base64
import requests
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.integration import Integration
from app.services.integrations.normalizers import NormalizedTask


class GmailService:
    TOKEN_URL = "https://oauth2.googleapis.com/token"
    GMAIL_BASE_URL = "https://gmail.googleapis.com/gmail/v1"

    ACTION_KEYWORDS = [
        "submit",
        "complete",
        "meeting",
        "deadline",
        "due",
        "interview",
        "review",
        "assignment",
        "exam",
    ]

    # ------------------------
    # TOKEN HANDLING
    # ------------------------
    def ensure_valid_access_token(
        self,
        integration: Integration,
        db: Session,
    ) -> str:

        now = datetime.utcnow()

        # token still valid
        if (
            integration.access_token
            and integration.expires_at
            and integration.expires_at > now + timedelta(minutes=2)
        ):
            return integration.access_token

        # refresh token required
        if not integration.refresh_token:
            raise ValueError("Missing refresh token for Gmail integration")

        resp = requests.post(
            self.TOKEN_URL,
            data={
                "client_id": settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "refresh_token": integration.refresh_token,
                "grant_type": "refresh_token",
            },
            timeout=30,
        )

        resp.raise_for_status()
        token_data = resp.json()

        integration.access_token = token_data["access_token"]
        expires_in = token_data.get("expires_in", 3600)

        integration.expires_at = datetime.utcnow() + timedelta(seconds=expires_in)
        integration.token_type = token_data.get("token_type", "Bearer")

        db.commit()
        db.refresh(integration)

        return integration.access_token

    # ------------------------
    # EMAIL → TASK LOGIC
    # ------------------------
    def email_to_task(
        self,
        subject: str,
        body: str,
        message_id: str,
    ) -> Optional[NormalizedTask]:

        text = f"{subject}\n{body}".lower()

        if not any(keyword in text for keyword in self.ACTION_KEYWORDS):
            return None

        category = "email_action"

        if "interview" in text or "meeting" in text:
            category = "meeting_prep"

        elif any(k in text for k in ["deadline", "due", "assignment", "exam"]):
            category = "assignment"

        return NormalizedTask(
            title=subject.strip()[:150] or "Gmail Action Item",
            description=body[:1000] if body else None,
            source="gmail",
            source_id=message_id,
            category=category,
            deadline=None,
            estimated_duration_minutes=30,
            is_college_related=False,
            is_mandatory=False,
            priority_base=1.0,
        )

    # ------------------------
    # FETCH EMAIL LIST
    # ------------------------
    def fetch_messages(
        self,
        integration: Integration,
        db: Session,
        max_results: int = 20,
    ) -> List[dict[str, Any]]:

        access_token = self.ensure_valid_access_token(integration, db)

        resp = requests.get(
            f"{self.GMAIL_BASE_URL}/users/me/messages",
            headers={"Authorization": f"Bearer {access_token}"},
            params={"maxResults": max_results},
            timeout=30,
        )

        resp.raise_for_status()

        messages = resp.json().get("messages", [])

        return messages

    # ------------------------
    # FETCH SINGLE EMAIL BODY
    # ------------------------
    def fetch_message_detail(
        self,
        message_id: str,
        integration: Integration,
        db: Session,
    ) -> dict[str, Any]:

        access_token = self.ensure_valid_access_token(integration, db)

        resp = requests.get(
            f"{self.GMAIL_BASE_URL}/users/me/messages/{message_id}",
            headers={"Authorization": f"Bearer {access_token}"},
            params={"format": "full"},
            timeout=30,
        )

        resp.raise_for_status()

        return resp.json()

    # ------------------------
    # PARSE EMAIL CONTENT
    # ------------------------
    def extract_email_content(
        self,
        message_data: dict,
    ) -> tuple[str, str]:

        headers = message_data.get("payload", {}).get("headers", [])

        subject = ""

        for h in headers:
            if h["name"].lower() == "subject":
                subject = h["value"]

        body = ""

        payload = message_data.get("payload", {})

        if "parts" in payload:
            for part in payload["parts"]:
                if part.get("mimeType") == "text/plain":
                    data = part["body"].get("data")

                    if data:
                        body = base64.urlsafe_b64decode(data).decode("utf-8")

        else:
            data = payload.get("body", {}).get("data")

            if data:
                body = base64.urlsafe_b64decode(data).decode("utf-8")

        return subject, body

    # ------------------------
    # MAIN SYNC FUNCTION
    # ------------------------
    def sync(
        self,
        integration: Integration,
        db: Session,
    ) -> list[NormalizedTask]:

        messages = self.fetch_messages(integration, db)

        tasks: list[NormalizedTask] = []

        for msg in messages:

            message_id = msg["id"]

            detail = self.fetch_message_detail(
                message_id,
                integration,
                db,
            )

            subject, body = self.extract_email_content(detail)

            task = self.email_to_task(
                subject,
                body,
                message_id,
            )

            if task:
                tasks.append(task)

        return tasks
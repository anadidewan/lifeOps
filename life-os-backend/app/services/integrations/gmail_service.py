from datetime import datetime, timedelta, timezone
from typing import Any, List

import base64
import json
import logging
import requests
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.integration import Integration
from app.services.integrations.normalizers import NormalizedTask

logger = logging.getLogger(__name__)

# Batch 5-10 emails per Gemini request (cost + latency)
GMAIL_AI_BATCH_SIZE = 8
GMAIL_MAX_STORED_MESSAGE_IDS = 3000


def _json_schema_instructions() -> str:
    return """
Output rules (critical):
- Return ONLY a single JSON object. No markdown. No code fences. No commentary before or after.
- Do not wrap the JSON in ``` blocks.
"""


def build_prompt(subject: str, body: str) -> str:
    return f"""{_json_schema_instructions()}
You are an AI that extracts actionable tasks from one email.

Return ONLY valid JSON in this exact shape:
{{
  "summary": "short summary",
  "items": [
    {{
      "title": "task title",
      "description": "details",
      "category": "meeting | assignment | general",
      "priority": 0,
      "estimated_minutes": 30,
      "deadline": "ISO-8601 datetime string or date-only string, or null"
    }}
  ]
}}

Field notes:
- "deadline": infer from the email if possible (e.g. due dates, "by Friday"); use ISO format (e.g. "2026-04-12" or "2026-04-12T17:00:00Z"); use null if unknown.

Rules:
- Only include real actionable tasks.
- Ignore newsletters or promotions.
- If no tasks, return an empty "items" array.
- Be concise.

Email:
Subject: {subject}
Body:
{body}
"""


def build_batch_prompt(
    emails: list[tuple[str, str, str]],
) -> str:
    """emails: list of (message_id, subject, body)"""
    blocks = []
    for message_id, subject, body in emails:
        blocks.append(
            f'---\nmessage_id: {message_id}\nSubject: {subject}\nBody:\n{body}\n'
        )
    joined = "\n".join(blocks)
    return f"""{_json_schema_instructions()}
You are an AI that extracts actionable tasks from multiple emails at once.

For EACH email below, return tasks grouped by that email's message_id.

Return ONLY valid JSON in this exact shape:
{{
  "emails": [
    {{
      "message_id": "must match the input message_id exactly",
      "summary": "short summary for that email",
      "items": [
        {{
          "title": "task title",
          "description": "details",
          "category": "meeting | assignment | general",
          "priority": 0,
          "estimated_minutes": 30,
          "deadline": "ISO-8601 datetime or date-only string, or null"
        }}
      ]
    }}
  ]
}}

Field notes:
- "deadline": infer from each email if possible; ISO format; null if unknown.
- Include one entry in "emails" for every input email (use empty items if nothing actionable).

Emails:
{joined}
"""


def _strip_markdown_json_fence(text: str) -> str:
    t = text.strip()
    if not t.startswith("```"):
        return t
    lines = t.split("\n")
    if lines and lines[0].startswith("```"):
        lines = lines[1:]
    if lines and lines[-1].strip() == "```":
        lines = lines[:-1]
    return "\n".join(lines).strip()


def _gemini_response_text(response: Any) -> str:
    """Use response.text; fall back to candidate parts (JSON mode sometimes leaves .text empty)."""
    t = getattr(response, "text", None)
    if t:
        return t.strip()
    try:
        cands = getattr(response, "candidates", None) or []
        if not cands:
            return ""
        parts = getattr(cands[0].content, "parts", None) or []
        return "".join(getattr(p, "text", "") or "" for p in parts).strip()
    except (AttributeError, IndexError, TypeError):
        return ""


def analyze_email(prompt: str) -> str:
    if not settings.GEMINI_API_KEY:
        return "{}"

    import google.generativeai as genai

    genai.configure(api_key=settings.GEMINI_API_KEY)
    model = genai.GenerativeModel(settings.GEMINI_MODEL)

    try:
        response = model.generate_content(
            prompt,
            generation_config={
                "temperature": 0.2,
                "response_mime_type": "application/json",
            },
        )
    except Exception as e:
        logger.warning("Gemini JSON mode failed (%s); retrying without response_mime_type", e)
        response = model.generate_content(prompt)

    raw = _gemini_response_text(response)
    if not raw:
        logger.warning(
            "Gemini returned empty output for generate_content (model=%s); check API key, quota, or safety blocks",
            settings.GEMINI_MODEL,
        )
        return "{}"
    return _strip_markdown_json_fence(raw)


def parse_json_with_retry(prompt: str) -> dict[str, Any]:
    """Parse model output; on failure, one extra analyze_email call (2 attempts total)."""
    raw = analyze_email(prompt)
    for attempt in range(2):
        try:
            text = _strip_markdown_json_fence(raw.strip())
            return json.loads(text)
        except json.JSONDecodeError:
            if attempt == 0:
                raw = analyze_email(prompt)
            else:
                logger.warning("Gemini returned non-JSON twice for batch/single prompt")
                return {}
    return {}


def _parse_deadline(value: Any) -> datetime | None:
    if value is None:
        return None
    if isinstance(value, str):
        s = value.strip()
        if not s or s.lower() in ("null", "none", ""):
            return None
    else:
        s = str(value).strip()
        if not s:
            return None
    try:
        if len(s) == 10 and s[4] == "-" and s[7] == "-":
            dt = datetime.fromisoformat(s)
            return dt.replace(tzinfo=timezone.utc)
        if s.endswith("Z"):
            s = s[:-1] + "+00:00"
        dt = datetime.fromisoformat(s)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt
    except ValueError:
        return None


def _normalized_tasks_from_items(
    items: list[Any],
    message_id: str,
    subject: str,
) -> list[NormalizedTask]:
    tasks: list[NormalizedTask] = []
    for idx, item in enumerate(items):
        if not isinstance(item, dict):
            continue
        em = item.get("estimated_minutes", 30)
        try:
            est = int(float(em)) if em is not None else 30
        except (TypeError, ValueError):
            est = 30

        pr = item.get("priority", 1)
        try:
            priority_base = float(pr)
        except (TypeError, ValueError):
            priority_base = 1.0

        deadline = _parse_deadline(item.get("deadline"))
        source_id = f"{message_id}:{idx}"

        tasks.append(
            NormalizedTask(
                title=(item.get("title") or subject or "Gmail task")[:150],
                description=item.get("description"),
                source="gmail",
                source_id=source_id,
                category=item.get("category") or "email_action",
                deadline=deadline,
                estimated_duration_minutes=est,
                is_college_related=False,
                is_mandatory=False,
                priority_base=priority_base,
            )
        )
    return tasks


def _load_processed_message_ids(integration: Integration) -> list[str]:
    raw = integration.gmail_processed_message_ids
    if not raw:
        return []
    try:
        data = json.loads(raw)
        if isinstance(data, list):
            return [str(x) for x in data]
    except json.JSONDecodeError:
        pass
    return []


def _merge_and_trim_processed(
    existing: list[str],
    new_ids: list[str],
) -> list[str]:
    seen = set(existing)
    out = list(existing)
    for mid in new_ids:
        if mid not in seen:
            seen.add(mid)
            out.append(mid)
    if len(out) > GMAIL_MAX_STORED_MESSAGE_IDS:
        out = out[-GMAIL_MAX_STORED_MESSAGE_IDS:]
    return out


class GmailService:
    TOKEN_URL = "https://oauth2.googleapis.com/token"
    GMAIL_BASE_URL = "https://gmail.googleapis.com/gmail/v1"

    # ------------------------
    # TOKEN HANDLING
    # ------------------------
    def ensure_valid_access_token(
        self,
        integration: Integration,
        db: Session,
    ) -> str:

        now = datetime.utcnow()

        if (
            integration.access_token
            and integration.expires_at
            and integration.expires_at > now + timedelta(minutes=2)
        ):
            return integration.access_token

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

    @staticmethod
    def _should_skip_email(subject: str, body: str) -> bool:
        if not subject.strip() and not body.strip():
            return True
        if "unsubscribe" in body.lower():
            return True
        return False

    # ------------------------
    # MAIN SYNC FUNCTION
    # ------------------------
    def sync(
        self,
        integration: Integration,
        db: Session,
    ) -> dict[str, Any]:

        processed_list = _load_processed_message_ids(integration)
        processed_set = set(processed_list)

        messages = self.fetch_messages(integration, db)

        skipped_cached = 0
        skipped_filtered = 0
        pending: list[tuple[str, str, str]] = []

        for msg in messages:
            message_id = msg["id"]
            if message_id in processed_set:
                skipped_cached += 1
                continue

            detail = self.fetch_message_detail(
                message_id,
                integration,
                db,
            )

            subject, body = self.extract_email_content(detail)

            if self._should_skip_email(subject, body):
                skipped_filtered += 1
                processed_list = _merge_and_trim_processed(processed_list, [message_id])
                processed_set.add(message_id)
                continue

            pending.append((message_id, subject, body))

        all_tasks: list[NormalizedTask] = []
        newly_processed: list[str] = []

        if settings.GEMINI_API_KEY and pending:
            for i in range(0, len(pending), GMAIL_AI_BATCH_SIZE):
                batch = pending[i : i + GMAIL_AI_BATCH_SIZE]
                if not batch:
                    continue

                prompt = build_batch_prompt(batch)
                parsed = parse_json_with_retry(prompt)

                by_id: dict[str, list[NormalizedTask]] = {}
                for block in parsed.get("emails", []):
                    if not isinstance(block, dict):
                        continue
                    mid = block.get("message_id")
                    if not mid:
                        continue
                    mid_s = str(mid)
                    items = block.get("items", [])
                    if not isinstance(items, list):
                        items = []
                    subj = ""
                    for m, s, _ in batch:
                        if m == mid_s:
                            subj = s
                            break
                    by_id[mid_s] = _normalized_tasks_from_items(items, mid_s, subj)

                for message_id, _, _ in batch:
                    tasks_for_msg = by_id.get(message_id) or []
                    all_tasks.extend(tasks_for_msg)
                    newly_processed.append(message_id)

            if newly_processed:
                processed_list = _merge_and_trim_processed(processed_list, newly_processed)
        elif pending and not settings.GEMINI_API_KEY:
            logger.warning("GEMINI_API_KEY not set; Gmail messages left unprocessed for next sync")

        integration.gmail_processed_message_ids = json.dumps(processed_list)
        db.commit()
        db.refresh(integration)

        return {
            "tasks": all_tasks,
            "meetings": [],
            "skipped": skipped_cached + skipped_filtered,
        }
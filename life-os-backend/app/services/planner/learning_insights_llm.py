"""Gemini enrichment for learning insights (planner).

Uses the same prompt + Gemini call pattern as Gmail (`gmail_service.analyze_email` / `parse_json_with_retry`).
"""

from __future__ import annotations

import json
import logging
from typing import Any

from app.schemas.planner import LearningInsightResponse
from app.core.config import settings
from app.services.integrations.gmail_service import (
    _gemini_response_text,
    _json_schema_instructions,
    parse_json_with_retry,
)

logger = logging.getLogger(__name__)


def _items_from_parsed(parsed: Any) -> list[Any]:
    """Accept {{\"items\": [...]}}, a bare list, or capitalized keys."""
    if isinstance(parsed, list):
        return parsed
    if not isinstance(parsed, dict):
        return []
    for key in ("items", "Items", "insights", "Insights"):
        v = parsed.get(key)
        if isinstance(v, list):
            return v
    return []


def _extract_item_summary(it: Any) -> str:
    if not isinstance(it, dict):
        return ""
    return str(
        it.get("summary")
        or it.get("Summary")
        or it.get("message")
        or it.get("text")
        or ""
    ).strip()


def _summaries_from_items(
    items_list: list[Any],
    insights: list[LearningInsightResponse],
) -> dict[int, str]:
    """
    Map summaries to DB task ids. Prefer row order when lengths match (models often
    omit or hallucinate task_id).
    """
    summaries: dict[int, str] = {}
    if len(items_list) == len(insights):
        for idx, ins in enumerate(insights):
            s = _extract_item_summary(items_list[idx])
            if s:
                summaries[ins.task_id] = s

    for it in items_list:
        if not isinstance(it, dict):
            continue
        tid = it.get("task_id", it.get("TaskId", it.get("id")))
        if tid is None:
            continue
        try:
            tid_int = int(tid)
        except (TypeError, ValueError):
            continue
        s = _extract_item_summary(it)
        if s:
            summaries[tid_int] = s
    return summaries


def build_plaintext_fallback_prompt(insights: list[LearningInsightResponse]) -> str:
    """When JSON shape fails, ask for N lines in fixed order (no JSON)."""
    lines: list[str] = []
    for i, ins in enumerate(insights, start=1):
        lines.append(
            f'{i}. task_id={ins.task_id} | {ins.title} | category={ins.category} | '
            f"distress={ins.distress_score:.2f} | completion_p={ins.completion_probability:.2f}"
        )
    block = "\n".join(lines)
    n = len(insights)
    return f"""You are a concise academic coach. Below are {n} coursework tasks in priority order.

Write exactly {n} lines of plain text only (not JSON, no markdown fences). Line 1 = task 1, line 2 = task 2, etc.
Each line: ONE short actionable coaching sentence for that task (max 220 characters). No numbering at the start of lines.

Tasks:
{block}
"""


def _gemini_plain_lines(prompt: str) -> list[str]:
    if not settings.GEMINI_API_KEY:
        return []

    import google.generativeai as genai

    genai.configure(api_key=settings.GEMINI_API_KEY)
    model = genai.GenerativeModel(settings.GEMINI_MODEL)
    response = model.generate_content(
        prompt,
        generation_config={"temperature": 0.35},
    )
    raw = _gemini_response_text(response)
    if not raw:
        return []
    out: list[str] = []
    for ln in raw.splitlines():
        t = ln.strip()
        if not t:
            continue
        # strip leading "1." or "- " some models add
        for prefix in ("- ", "* ", "• "):
            if t.startswith(prefix):
                t = t[len(prefix) :].strip()
        if len(t) > 2 and t[0].isdigit() and (t[1] == "." or t[1] == ")"):
            parts = t.split(".", 1) if "." in t[:4] else t.split(")", 1)
            if len(parts) > 1:
                t = parts[-1].strip()
        out.append(t[:500])
    return out


def build_learning_insights_prompt(rows: list[dict[str, Any]]) -> str:
    """Same structure as email prompts: JSON rules block + schema + context payload."""
    payload = json.dumps(rows, indent=2)
    return f"""{_json_schema_instructions()}
You are a concise academic coach for a university student. You receive pending coursework tasks
with model-estimated distress (0–1, higher = more avoidance/friction) and completion probability (0–1).

Return ONLY valid JSON in this exact shape:
{{
  "items": [
    {{
      "task_id": <integer matching input>,
      "summary": "<one sentence: actionable, specific, encouraging; max 220 characters>"
    }}
  ]
}}

Rules:
- Produce exactly one item per task_id in the input (same task_ids).
- Do not invent assignments; only reference titles/categories given.
- If distress is 0 and completion is ~0.5, acknowledge limited history and suggest a concrete next step.
- Be concise.

Tasks data (JSON):
{payload}
"""


def enrich_learning_insights_with_gemini(
    insights: list[LearningInsightResponse],
) -> list[LearningInsightResponse]:
    """Attach llm_summary per insight using Gemini; on failure returns insights unchanged."""
    if not insights:
        return insights

    rows: list[dict[str, Any]] = []
    for i in insights:
        rows.append(
            {
                "task_id": i.task_id,
                "title": i.title,
                "category": i.category,
                "distress_score": round(i.distress_score, 4),
                "completion_probability": round(i.completion_probability, 4),
                "estimated_duration_minutes": i.estimated_duration_minutes,
                "adjusted_duration_minutes": i.adjusted_duration_minutes,
            }
        )

    prompt = build_learning_insights_prompt(rows)
    try:
        parsed = parse_json_with_retry(prompt)
    except Exception as e:
        # Quota (429), auth, network, etc. — never fail the HTTP request; UI falls back to numeric lines.
        logger.warning(
            "Learning insights Gemini call failed (%s): %s",
            type(e).__name__,
            e,
        )
        return insights

    # Note: parse_json_with_retry returns {{}} on JSON failure — empty dict is falsy; check structure explicitly.
    items_list = _items_from_parsed(parsed)
    summaries: dict[int, str] = {}

    if items_list:
        summaries = _summaries_from_items(items_list, insights)

    if not summaries:
        logger.warning(
            "Learning insights: JSON path produced no summaries (items=%s parsed_keys=%s); trying plain-text fallback",
            len(items_list),
            list(parsed.keys()) if isinstance(parsed, dict) else type(parsed).__name__,
        )
        plain = build_plaintext_fallback_prompt(insights)
        lines = _gemini_plain_lines(plain)
        for idx, ins in enumerate(insights):
            if idx < len(lines) and lines[idx].strip():
                summaries[ins.task_id] = lines[idx].strip()

    if not summaries:
        logger.warning("Learning insights: Gemini produced no summaries after JSON + plain fallback")
        return insights

    out: list[LearningInsightResponse] = []
    for ins in insights:
        summary = summaries.get(ins.task_id)
        out.append(
            LearningInsightResponse(
                task_id=ins.task_id,
                title=ins.title,
                category=ins.category,
                distress_score=ins.distress_score,
                completion_probability=ins.completion_probability,
                estimated_duration_minutes=ins.estimated_duration_minutes,
                adjusted_duration_minutes=ins.adjusted_duration_minutes,
                llm_summary=summary,
            )
        )

    if len(summaries) < len(insights):
        logger.warning(
            "Gemini returned %s summaries for %s insights; missing keys kept as null",
            len(summaries),
            len(insights),
        )

    return out

from datetime import datetime, date, time, timedelta, timezone
from zoneinfo import ZoneInfo
from typing import List

from app.schemas.planner import (
    PlannerMeetingResponse,
    RankedTaskResponse,
    TimeSlotResponse,
    ScheduledTaskBlockResponse,
    UnscheduledTaskResponse,
)


class SchedulingService:
    def _get_user_day_window(self, target_date: date, user_timezone: str, wake_time=None, sleep_time=None):
        tz = ZoneInfo(user_timezone)

        day_start_local = datetime.combine(target_date, wake_time or time(8, 0)).replace(tzinfo=tz)
        day_end_local = datetime.combine(target_date, sleep_time or time(22, 0)).replace(tzinfo=tz)

        return day_start_local, day_end_local

    def _subtract_meetings_from_window(
        self,
        day_start: datetime,
        day_end: datetime,
        meetings: List[PlannerMeetingResponse],
        user_timezone: str,
    ) -> List[TimeSlotResponse]:
        tz = ZoneInfo(user_timezone)

        busy_intervals = []
        for meeting in meetings:
            start_local = meeting.start_time.astimezone(tz)
            end_local = meeting.end_time.astimezone(tz)

            # clip to user day window
            if end_local <= day_start or start_local >= day_end:
                continue

            clipped_start = max(start_local, day_start)
            clipped_end = min(end_local, day_end)

            busy_intervals.append((clipped_start, clipped_end))

        busy_intervals.sort(key=lambda x: x[0])

        merged = []
        for start, end in busy_intervals:
            if not merged or start > merged[-1][1]:
                merged.append([start, end])
            else:
                merged[-1][1] = max(merged[-1][1], end)

        free_slots = []
        cursor = day_start

        for start, end in merged:
            if start > cursor:
                duration = int((start - cursor).total_seconds() // 60)
                if duration > 0:
                    free_slots.append(
                        TimeSlotResponse(
                            start_time=cursor,
                            end_time=start,
                            duration_minutes=duration,
                        )
                    )
            cursor = max(cursor, end)

        if cursor < day_end:
            duration = int((day_end - cursor).total_seconds() // 60)
            if duration > 0:
                free_slots.append(
                    TimeSlotResponse(
                        start_time=cursor,
                        end_time=day_end,
                        duration_minutes=duration,
                    )
                )

        return free_slots

    def schedule_tasks_into_slots(
        self,
        ranked_tasks: List[RankedTaskResponse],
        free_slots: List[TimeSlotResponse],
        focus_block_minutes: int = 60,
        break_minutes: int = 15,
    ):
        scheduled_blocks: List[ScheduledTaskBlockResponse] = []
        unscheduled_tasks: List[UnscheduledTaskResponse] = []

        remaining_slots = [
            {
                "start": slot.start_time,
                "end": slot.end_time,
                "duration": slot.duration_minutes,
            }
            for slot in free_slots
        ]

        for task in ranked_tasks:
            remaining_task_minutes = task.estimated_duration_minutes or focus_block_minutes
            placed_any = False

            for slot in remaining_slots:
                while remaining_task_minutes > 0 and slot["duration"] > 0:
                    alloc_minutes = min(
                        remaining_task_minutes,
                        slot["duration"],
                        focus_block_minutes,
                    )

                    if alloc_minutes <= 0:
                        break

                    block_start = slot["start"]
                    block_end = block_start + timedelta(minutes=alloc_minutes)

                    scheduled_blocks.append(
                        ScheduledTaskBlockResponse(
                            task_id=task.task_id,
                            title=task.title,
                            category=task.category,
                            start_time=block_start,
                            end_time=block_end,
                            duration_minutes=alloc_minutes,
                            final_score=task.final_score,
                            rationale=task.rationale,
                        )
                    )

                    placed_any = True
                    remaining_task_minutes -= alloc_minutes

                    slot["start"] = block_end
                    slot["duration"] -= alloc_minutes

                    if remaining_task_minutes > 0:
                        if slot["duration"] > break_minutes:
                            slot["start"] += timedelta(minutes=break_minutes)
                            slot["duration"] -= break_minutes
                        else:
                            break

                if remaining_task_minutes <= 0:
                    break

            if remaining_task_minutes > 0:
                unscheduled_tasks.append(
                    UnscheduledTaskResponse(
                        task_id=task.task_id,
                        title=task.title,
                        category=task.category,
                        estimated_duration_minutes=remaining_task_minutes,
                        final_score=task.final_score,
                        reason=(
                            "Not enough free time remaining"
                            if placed_any
                            else "No suitable free slot available"
                        ),
                    )
                )

        scheduled_blocks.sort(key=lambda x: x.start_time)
        return scheduled_blocks, unscheduled_tasks
import type { TaskResponse } from "@/lib/api/types";
import type { DetailedPlanTask, TaskCategory, TaskSource } from "@/lib/dashboard/day-plan-detail";

const CATEGORIES: TaskCategory[] = [
  "assignment",
  "meeting",
  "quiz",
  "reading",
  "project",
  "exam",
];

function mapCategory(raw: string): TaskCategory {
  const lower = raw.toLowerCase();
  return (CATEGORIES.includes(lower as TaskCategory) ? lower : "assignment") as TaskCategory;
}

function mapSource(source: string): TaskSource {
  if (source === "gmail") return "email";
  return "canvas";
}

function deadlineParts(deadline: string | null): { timeMinutes: number; timeLabel: string } {
  if (!deadline) {
    return { timeMinutes: 10 * 60, timeLabel: "10:00 AM" };
  }
  const d = new Date(deadline);
  if (Number.isNaN(d.getTime())) {
    return { timeMinutes: 10 * 60, timeLabel: "10:00 AM" };
  }
  const timeMinutes = d.getHours() * 60 + d.getMinutes();
  const timeLabel = d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  return { timeMinutes, timeLabel };
}

/** Map API task row to dashboard plan row (today / same-day tasks). */
export function taskResponseToDetailedPlanTask(task: TaskResponse): DetailedPlanTask {
  const { timeMinutes, timeLabel } = deadlineParts(task.deadline);
  return {
    id: String(task.id),
    title: task.title,
    source: mapSource(task.source),
    category: mapCategory(task.category),
    timeMinutes,
    timeLabel,
    meta: task.description?.slice(0, 80) ?? undefined,
    dueThatDay: Boolean(task.deadline),
  };
}

import type { DetailedPlanTask } from "@/lib/dashboard/day-plan-detail";

/** Lightweight rows when only ranked titles exist for a non-today day. */
export function tasksFromPreviewTitles(
  titles: string[],
  dayKey: string
): DetailedPlanTask[] {
  return titles.map((title, i) => {
    const mins = 9 * 60 + i * 40;
    const h24 = Math.floor(mins / 60) % 24;
    const m = mins % 60;
    const d = new Date(2000, 0, 1, h24, m);
    const timeLabel = d.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
    return {
      id: `${dayKey}-pv-${i}`,
      title,
      source: "canvas",
      category: "assignment",
      timeMinutes: mins,
      timeLabel,
      meta: "Planner queue",
      dueThatDay: false,
    };
  });
}

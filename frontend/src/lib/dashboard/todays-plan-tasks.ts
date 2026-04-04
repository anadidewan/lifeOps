/**
 * Today's plan tasks for end-of-day review.
 * When DEMO_MODE is on, uses rich demo tasks; otherwise uses calendar slice.
 */

import { DEMO_MODE, mockTodaysTasks, type PlanTask } from "@/lib/mock/demo-dashboard-data";

export type { PlanTask };

export const PLAN_TASKS_BY_WEEKDAY_INDEX: Record<number, PlanTask[]> = {
  0: [{ id: "plan-mon-econ", name: "Econ (2h)" }],
  1: [{ id: "plan-tue-db", name: "DB (3h)" }],
  2: [{ id: "plan-wed-review", name: "Review" }],
};

export function getTodayMondayFirstIndex(): number {
  const d = new Date().getDay();
  return d === 0 ? 6 : d - 1;
}

export function getTodaysPlanTasks(): PlanTask[] {
  if (DEMO_MODE) return mockTodaysTasks;
  const idx = getTodayMondayFirstIndex();
  return PLAN_TASKS_BY_WEEKDAY_INDEX[idx] ?? [];
}

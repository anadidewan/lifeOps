import type {
  EndOfDayReviewSummary,
  ExtraCompletedAssignment,
  TaskReviewEntry,
} from "@/types/end-of-day-review";

export function buildEndOfDaySummary(
  tasks: TaskReviewEntry[],
  extras: ExtraCompletedAssignment[]
): EndOfDayReviewSummary {
  const answered = tasks.filter((t) => t.status !== null);
  const fullYes = answered.filter((t) => t.status === "yes").length;

  let goalsLine: string;
  if (answered.length === 0) {
    goalsLine = "Goals completed: nothing marked yet";
  } else if (fullYes === 0) {
    goalsLine = "Goals completed: no tasks fully completed";
  } else if (fullYes === 1) {
    goalsLine = "Goals completed: 1 task fully completed";
  } else {
    goalsLine = `Goals completed: ${fullYes} tasks fully completed`;
  }

  const weak = answered.filter(
    (t) => t.status === "no" || (t.status === "partial" && t.completionValue < 60)
  );

  let needLine: string;
  if (weak.length === 0) {
    needLine = "Need for improvement: keep your current rhythm";
  } else {
    const db = weak.find((t) => /db/i.test(t.taskName) || t.taskId.includes("db"));
    if (db) {
      needLine = "Need for improvement: Database Project needs more consistency";
    } else {
      needLine = `Need for improvement: ${weak[0].taskName} needs more consistency`;
    }
  }

  const noCount = answered.filter((t) => t.status === "no").length;
  const partialLow = answered.filter(
    (t) => t.status === "partial" && t.completionValue < 40
  ).length;

  let tomorrowLine = "Tomorrow adjustment: Similar pace tomorrow";

  if (extras.length >= 1 && answered.length > 0 && fullYes >= answered.length) {
    tomorrowLine = "Tomorrow adjustment: You are ahead for tomorrow";
  } else if (extras.length >= 1 && fullYes >= Math.max(0, answered.length - 1) && answered.length > 0) {
    tomorrowLine = "Tomorrow adjustment: Lighter day tomorrow";
  } else if (noCount >= 2 || partialLow >= 2) {
    tomorrowLine = "Tomorrow adjustment: Heavier day tomorrow";
  } else if (noCount === 1 || partialLow === 1) {
    tomorrowLine = "Tomorrow adjustment: Slightly heavier day tomorrow";
  }

  const extraLine =
    extras.length === 0
      ? "Extra work done: none logged"
      : `Extra work done: ${extras.map((e) => `${e.title} completed early`).join(". ")}`;

  return {
    goalsCompleted: goalsLine,
    needForImprovement: needLine,
    tomorrowAdjustment: tomorrowLine,
    extraWorkDone: extraLine,
  };
}

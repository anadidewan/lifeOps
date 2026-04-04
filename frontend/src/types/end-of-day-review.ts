/**
 * End-of-day review payload shape for future API sync.
 * All completion values are 0 to 100 inclusive.
 */

export type TaskReviewStatus = "yes" | "partial" | "no" | null;

export interface TaskReviewEntry {
  taskId: string;
  taskName: string;
  status: TaskReviewStatus;
  /** Effective completion 0 to 100; yes implies 100, no implies 0 when submitted. */
  completionValue: number;
}

export interface ExtraCompletedAssignment {
  id: string;
  title: string;
}

export interface EndOfDayReviewPayload {
  reviewedAt: string;
  tasks: TaskReviewEntry[];
  extraCompleted: ExtraCompletedAssignment[];
}

export interface EndOfDayReviewSummary {
  goalsCompleted: string;
  needForImprovement: string;
  tomorrowAdjustment: string;
  extraWorkDone: string;
}

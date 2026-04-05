/** Mirrors backend Pydantic models (JSON). Dates are ISO strings. */

export type SyncProvider = "canvas" | "gmail";

export interface SyncResultResponse {
  provider: string;
  tasks_created?: number;
  tasks_updated?: number;
  meetings_created?: number;
  meetings_updated?: number;
  skipped?: number;
  status?: string;
  detail?: string | null;
}

export interface TaskResponse {
  id: number;
  user_id: number;
  title: string;
  description: string | null;
  source: string;
  source_id: string | null;
  category: string;
  status: string;
  deadline: string | null;
  estimated_duration_minutes: number | null;
  priority_base: number;
  urgency_score: number;
  importance_score: number;
  risk_score: number;
  distress_score: number;
  completion_probability: number;
  is_college_related: boolean;
  is_mandatory: boolean;
}

export interface TaskCreatePayload {
  title: string;
  description?: string | null;
  source: string;
  source_id?: string | null;
  category: string;
  deadline?: string | null;
  estimated_duration_minutes?: number | null;
  priority_base?: number;
  is_college_related?: boolean;
  is_mandatory?: boolean;
}

export interface TaskUpdatePayload {
  title?: string | null;
  description?: string | null;
  category?: string | null;
  status?: string | null;
  deadline?: string | null;
  estimated_duration_minutes?: number | null;
  urgency_score?: number | null;
  importance_score?: number | null;
  risk_score?: number | null;
  distress_score?: number | null;
  completion_probability?: number | null;
  is_college_related?: boolean | null;
  is_mandatory?: boolean | null;
}

export interface TaskReschedulePayload {
  new_deadline: string;
  reason?: string | null;
}

export interface CompletionLogCreatePayload {
  task_id: number;
  planned_start?: string | null;
  planned_end?: string | null;
  actual_start?: string | null;
  actual_end?: string | null;
  completed_on_time?: boolean | null;
  skipped?: boolean;
  rescheduled_count?: number;
}

export interface CompletionLogResponse {
  id: number;
  task_id: number;
  planned_start: string | null;
  planned_end: string | null;
  actual_start: string | null;
  actual_end: string | null;
  completed_on_time: boolean | null;
  skipped: boolean;
  rescheduled_count: number;
  created_at: string;
}

export interface MeetingResponse {
  id: number;
  user_id: number;
  title: string;
  description: string | null;
  source: string;
  source_id: string | null;
  start_time: string;
  end_time: string;
  location: string | null;
  meeting_link: string | null;
  is_mandatory: boolean;
  is_college_related: boolean;
}

export interface MeetingCreatePayload {
  title: string;
  description?: string | null;
  source: string;
  source_id?: string | null;
  start_time: string;
  end_time: string;
  location?: string | null;
  meeting_link?: string | null;
  is_mandatory?: boolean;
  is_college_related?: boolean;
}

export interface MeetingUpdatePayload {
  title?: string | null;
  description?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  location?: string | null;
  meeting_link?: string | null;
  is_mandatory?: boolean | null;
  is_college_related?: boolean | null;
}

export interface RiskInsightResponse {
  task_id: number;
  title: string;
  category: string;
  deadline: string | null;
  estimated_duration_minutes: number | null;
  risk_score: number;
  risk_reason: string;
}

export interface LearningInsightResponse {
  task_id: number;
  title: string;
  category: string;
  distress_score: number;
  completion_probability: number;
  estimated_duration_minutes: number | null;
  adjusted_duration_minutes: number | null;
  /** Present when backend ran Gemini enrichment */
  llm_summary?: string | null;
}

export interface PlannerPreviewResponse {
  date: string;
  ranked_tasks: unknown[];
  meetings: unknown[];
}

export interface GeneratedPlanResponse {
  date: string;
  meetings: unknown[];
  free_slots: unknown[];
  scheduled_blocks: unknown[];
  unscheduled_tasks: unknown[];
}

export interface PlanResponse {
  id: number;
  user_id: number;
  plan_date: string;
  status: string;
  summary: string | null;
  blocks: unknown[];
}

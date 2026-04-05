import { apiJson } from "./http";
import type {
  GeneratedPlanResponse,
  LearningInsightResponse,
  PlannerPreviewResponse,
  PlanResponse,
  RiskInsightResponse,
} from "./types";

function dateParam(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export async function getPlannerPreview(targetDate: Date): Promise<PlannerPreviewResponse> {
  const q = new URLSearchParams({ target_date: dateParam(targetDate) });
  return apiJson<PlannerPreviewResponse>(`/planner/preview?${q}`, { method: "GET" });
}

export async function generateDayPlan(targetDate: Date): Promise<GeneratedPlanResponse> {
  const q = new URLSearchParams({ target_date: dateParam(targetDate) });
  return apiJson<GeneratedPlanResponse>(`/planner/generate?${q}`, { method: "GET" });
}

export async function getSavedPlan(targetDate: Date): Promise<PlanResponse> {
  const q = new URLSearchParams({ target_date: dateParam(targetDate) });
  return apiJson<PlanResponse>(`/planner/saved?${q}`, { method: "GET" });
}

export async function generateAndSavePlan(targetDate: Date): Promise<PlanResponse> {
  const q = new URLSearchParams({ target_date: dateParam(targetDate) });
  return apiJson<PlanResponse>(`/planner/generate-and-save?${q}`, { method: "POST" });
}

export async function getRiskInsights(targetDate: Date): Promise<RiskInsightResponse[]> {
  const q = new URLSearchParams({ target_date: dateParam(targetDate) });
  return apiJson<RiskInsightResponse[]>(`/planner/risk-insights?${q}`, { method: "GET" });
}

export async function getLearningInsights(targetDate: Date): Promise<LearningInsightResponse[]> {
  const q = new URLSearchParams({ target_date: dateParam(targetDate) });
  return apiJson<LearningInsightResponse[]>(`/planner/learning-insights?${q}`, { method: "GET" });
}

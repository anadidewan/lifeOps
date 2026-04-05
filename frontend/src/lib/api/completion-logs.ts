import { apiJson } from "./http";
import type { CompletionLogCreatePayload, CompletionLogResponse } from "./types";

export async function createCompletionLog(payload: CompletionLogCreatePayload): Promise<CompletionLogResponse> {
  return apiJson<CompletionLogResponse>(`/completion-logs`, { method: "POST", json: payload });
}

export async function listCompletionLogsForTask(taskId: number): Promise<CompletionLogResponse[]> {
  return apiJson<CompletionLogResponse[]>(`/completion-logs/task/${taskId}`, { method: "GET" });
}

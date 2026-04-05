import { apiJson } from "./http";
import type {
  CompletionLogCreatePayload,
  CompletionLogResponse,
  TaskCreatePayload,
  TaskResponse,
  TaskUpdatePayload,
  TaskReschedulePayload,
} from "./types";

export async function listTasks(): Promise<TaskResponse[]> {
  return apiJson<TaskResponse[]>(`/tasks`, { method: "GET" });
}

export async function createTask(payload: TaskCreatePayload): Promise<TaskResponse> {
  return apiJson<TaskResponse>(`/tasks`, { method: "POST", json: payload });
}

export async function updateTask(taskId: number, payload: TaskUpdatePayload): Promise<TaskResponse> {
  return apiJson<TaskResponse>(`/tasks/${taskId}`, { method: "PATCH", json: payload });
}

export async function completeTask(taskId: number): Promise<TaskResponse> {
  return apiJson<TaskResponse>(`/tasks/${taskId}/complete`, { method: "POST" });
}

export async function skipTask(taskId: number): Promise<TaskResponse> {
  return apiJson<TaskResponse>(`/tasks/${taskId}/skip`, { method: "POST" });
}

export async function rescheduleTask(taskId: number, payload: TaskReschedulePayload): Promise<TaskResponse> {
  return apiJson<TaskResponse>(`/tasks/${taskId}/reschedule`, { method: "POST", json: payload });
}

export async function createTaskCompletionLog(
  taskId: number,
  payload: Omit<CompletionLogCreatePayload, "task_id">
): Promise<CompletionLogResponse> {
  return apiJson<CompletionLogResponse>(`/tasks/${taskId}/completion-log`, {
    method: "POST",
    json: { task_id: taskId, ...payload },
  });
}

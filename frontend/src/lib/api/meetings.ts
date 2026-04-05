import { apiJson } from "./http";
import type { MeetingCreatePayload, MeetingResponse, MeetingUpdatePayload } from "./types";

export async function listMeetings(): Promise<MeetingResponse[]> {
  return apiJson<MeetingResponse[]>(`/meetings`, { method: "GET" });
}

export async function createMeeting(payload: MeetingCreatePayload): Promise<MeetingResponse> {
  return apiJson<MeetingResponse>(`/meetings`, { method: "POST", json: payload });
}

export async function updateMeeting(meetingId: number, payload: MeetingUpdatePayload): Promise<MeetingResponse> {
  return apiJson<MeetingResponse>(`/meetings/${meetingId}`, { method: "PATCH", json: payload });
}

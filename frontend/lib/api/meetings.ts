import { apiRequest } from "./client";
import type { Meeting, MeetingEvent, Participant } from "./types";

export type CreateMeetingInput = {
  host_user_id: string;
  host_name?: string | null;
  title: string;
  description?: string | null;
  meeting_code: string;
  status?: "SCHEDULED" | "ACTIVE" | "ENDED" | "CANCELED";
  scheduled_start_at?: string | null;
  scheduled_end_at?: string | null;
  started_at?: string | null;
  ended_at?: string | null;
  max_participants?: number | null;
  settings?: Record<string, unknown> | null;
};

export type UpdateMeetingInput = Partial<CreateMeetingInput>;

export function createMeeting(payload: CreateMeetingInput) {
  return apiRequest<Meeting>("/api/v1/meetings", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getMeetings() {
  return apiRequest<Meeting[]>("/api/v1/meetings");
}

export function getMeeting(meetingId: string) {
  const safeId = encodeURIComponent((meetingId || "").trim());
  return apiRequest<Meeting>(`/api/v1/meetings/${safeId}`);
}

export function updateMeeting(meetingId: string, payload: UpdateMeetingInput) {
  const safeId = encodeURIComponent((meetingId || "").trim());
  return apiRequest<Meeting>(`/api/v1/meetings/${safeId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteMeeting(meetingId: string) {
  const safeId = encodeURIComponent((meetingId || "").trim());
  return apiRequest<{ message: string }>(`/api/v1/meetings/${safeId}`, {
    method: "DELETE",
  });
}

export function joinMeeting(meetingId: string, displayName?: string) {
  const safeId = encodeURIComponent((meetingId || "").trim());
  return apiRequest<Participant>(`/api/v1/meetings/${safeId}/join`, {
    method: "POST",
    body: JSON.stringify({ display_name: displayName }),
  });
}

export function leaveMeeting(meetingId: string) {
  const safeId = encodeURIComponent((meetingId || "").trim());
  return apiRequest<{ message: string }>(`/api/v1/meetings/${safeId}/leave`, {
    method: "POST",
  });
}

export function getMeetingEvents(meetingId: string) {
  const safeId = encodeURIComponent((meetingId || "").trim());
  return apiRequest<MeetingEvent[]>(`/api/v1/meetings/${safeId}/events`);
}
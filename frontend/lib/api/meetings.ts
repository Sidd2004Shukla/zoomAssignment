import { apiRequest } from "./client";
import type { Meeting, MeetingEvent, Participant } from "./types";

export type CreateMeetingInput = {
  host_user_id: string;
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
  return apiRequest<Meeting>(`/api/v1/meetings/${meetingId}`);
}

export function updateMeeting(meetingId: string, payload: UpdateMeetingInput) {
  return apiRequest<Meeting>(`/api/v1/meetings/${meetingId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteMeeting(meetingId: string) {
  return apiRequest<{ message: string }>(`/api/v1/meetings/${meetingId}`, {
    method: "DELETE",
  });
}

export function joinMeeting(meetingId: string, displayName?: string) {
  return apiRequest<Participant>(`/api/v1/meetings/${meetingId}/join`, {
    method: "POST",
    body: JSON.stringify({ display_name: displayName }),
  });
}

export function leaveMeeting(meetingId: string) {
  return apiRequest<{ message: string }>(`/api/v1/meetings/${meetingId}/leave`, {
    method: "POST",
  });
}

export function getMeetingEvents(meetingId: string) {
  return apiRequest<MeetingEvent[]>(`/api/v1/meetings/${meetingId}/events`);
}
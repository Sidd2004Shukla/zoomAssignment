import { apiRequest } from "./client";
import type { Participant } from "./types";

export type CreateParticipantInput = {
  user_id?: string | null;
  display_name?: string | null;
  role?: "HOST" | "CO_HOST" | "PARTICIPANT";
  status?: "INVITED" | "JOINED" | "LEFT" | "REMOVED";
  is_muted?: boolean;
  is_video_enabled?: boolean;
  is_removed?: boolean;
};

export function addParticipant(meetingId: string, payload: CreateParticipantInput) {
  return apiRequest<Participant>(`/api/v1/meetings/${meetingId}/participants`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getParticipants(meetingId: string) {
  return apiRequest<Participant[]>(`/api/v1/meetings/${meetingId}/participants`);
}

export function removeParticipant(meetingId: string, participantId: string) {
  return apiRequest<{ message: string }>(
    `/api/v1/meetings/${meetingId}/participants/${participantId}`,
    {
      method: "DELETE",
    }
  );
}

export function muteParticipant(
  meetingId: string,
  participantId: string,
  isMuted = true
) {
  return apiRequest<Participant>(
    `/api/v1/meetings/${meetingId}/participants/${participantId}/mute`,
    {
      method: "POST",
      body: JSON.stringify({ is_muted: isMuted }),
    }
  );
}

export function muteAllParticipants(meetingId: string) {
  return apiRequest<{ message: string }>(
    `/api/v1/meetings/${meetingId}/participants/mute-all`,
    {
      method: "POST",
    }
  );
}
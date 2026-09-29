import { apiRequest } from "./client";

export type CreateZegoTokenInput = {
  room_id: string;
  user_id: string;
  user_name: string;
};

export type ZegoTokenResponse = {
  app_id: string;
  token: string;
  room_id: string;
  user_id: string;
  user_name: string;
};

export function createZegoToken(meetingId: string, payload: CreateZegoTokenInput) {
  return apiRequest<ZegoTokenResponse>(`/api/v1/meetings/${meetingId}/zego-token`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
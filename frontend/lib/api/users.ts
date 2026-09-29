import { apiRequest } from "./client";
import type { User } from "./types";

export type CreateUserInput = {
  auth_provider_user_id: string;
  email: string;
  name?: string | null;
  avatar_url?: string | null;
  status?: "ACTIVE" | "INVITED" | "DISABLED";
};

export function createUser(payload: CreateUserInput) {
  return apiRequest<User>("/api/v1/users", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getUser(userId: string) {
  return apiRequest<User>(`/api/v1/users/${userId}`);
}
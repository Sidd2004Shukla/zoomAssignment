import { apiRequest } from "./client";
import type { User } from "./types";

export async function getCurrentUser(): Promise<User | null> {
  try {
    return await apiRequest<User>("/api/v1/auth/me");
  } catch {
    return null;
  }
}
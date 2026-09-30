"use client";

import type { PropsWithChildren } from "react";

/**
 * In accordance with assignment instructions ("No Login Required: Assume a default user is logged in"),
 * AuthGuard permits instant access to the application using the default host profile, while Clerk
 * sign-in/up remains fully available as an optional bonus feature.
 */
export const AuthGuard = ({ children }: PropsWithChildren) => {
  return <>{children}</>;
};

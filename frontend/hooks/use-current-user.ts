"use client";

import { useUser } from "@clerk/nextjs";

export interface ZoomUser {
  id: string;
  fullName: string | null;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  imageUrl?: string | null;
  primaryEmailAddress?: {
    emailAddress: string;
  } | null;
}

export const DEFAULT_USER: ZoomUser = {
  id: "user_zoom_default",
  fullName: "Alex Morgan",
  firstName: "Alex",
  lastName: "Morgan",
  username: "alex_morgan",
  imageUrl: null,
  primaryEmailAddress: {
    emailAddress: "alex.morgan@zoomclone.local",
  },
};

export function useCurrentUser() {
  const { user: clerkUser, isLoaded, isSignedIn } = useUser();

  if (isLoaded && isSignedIn && clerkUser) {
    return {
      user: clerkUser as unknown as ZoomUser,
      isLoaded: true,
      isSignedIn: true,
      isDefaultUser: false,
    };
  }

  // When signed out or when Clerk is optional, return the default seeded host user
  return {
    user: DEFAULT_USER,
    isLoaded: true,
    isSignedIn: Boolean(isSignedIn),
    isDefaultUser: !isSignedIn,
  };
}

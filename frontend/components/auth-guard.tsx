"use client";

import { RedirectToSignIn, SignedIn, SignedOut } from "@clerk/nextjs";
import type { PropsWithChildren } from "react";

export const AuthGuard = ({ children }: PropsWithChildren) => {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
};

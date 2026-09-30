import type { PropsWithChildren } from "react";

import { AuthGuard } from "@/components/auth-guard";

const RootLayout = ({ children }: PropsWithChildren) => {
  return (
    <main>
      <AuthGuard>{children}</AuthGuard>
    </main>
  );
};

export default RootLayout;

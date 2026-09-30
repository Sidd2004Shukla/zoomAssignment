import type { PropsWithChildren } from "react";

import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";

const HomeLayout = ({ children }: PropsWithChildren) => {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <div className="flex pt-[65px]">
        <Sidebar />

        <section className="min-h-[calc(100vh-65px)] flex-1 bg-white">
          <div className="w-full">{children}</div>
        </section>
      </div>
    </main>
  );
};

export default HomeLayout;
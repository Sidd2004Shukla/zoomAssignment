"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home } from "lucide-react";

export const Sidebar = () => {
  const pathname = usePathname();

  const isActive = pathname === "/";

  return (
    <aside className="sticky left-0 top-[105px] hidden h-[calc(100vh-105px)] w-[220px] shrink-0 border-r border-[#e5e7eb] bg-white lg:block">
      <div className="p-5">
        <Link
          href="/"
          className={`flex items-center gap-3 rounded-xl px-4 py-3 text-[15px] font-medium transition ${
            isActive
              ? "bg-[#eaf2ff] text-[#2d6cdf]"
              : "text-[#5d6275] hover:bg-[#f5f7fa]"
          }`}
        >
          <Home className="h-5 w-5" strokeWidth={2} />
          <span>Home</span>
        </Link>
      </div>
    </aside>
  );
};
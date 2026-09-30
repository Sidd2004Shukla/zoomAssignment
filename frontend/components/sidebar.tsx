"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, History, Home, Tv, Video } from "lucide-react";

const NAV_ITEMS = [
  {
    label: "Home",
    route: "/",
    icon: Home,
  },
  {
    label: "Upcoming",
    route: "/upcoming",
    icon: CalendarDays,
  },
  {
    label: "Previous",
    route: "/previous",
    icon: History,
  },
  {
    label: "Personal Room",
    route: "/personal-room",
    icon: Tv,
  },
];

export const Sidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="sticky left-0 top-[65px] hidden h-[calc(100vh-65px)] w-[230px] shrink-0 border-r border-[#e5e7eb] bg-white lg:block">
      <div className="flex flex-col gap-1.5 p-4">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.route ||
            (item.route !== "/" && pathname.startsWith(item.route));

          const Icon = item.icon;

          return (
            <Link
              key={item.route}
              href={item.route}
              className={`flex items-center gap-3.5 rounded-xl px-4 py-3 text-[14px] font-medium transition ${
                isActive
                  ? "bg-[#eaf2ff] font-semibold text-[#2d6cdf]"
                  : "text-[#5d6275] hover:bg-[#f5f7fa] hover:text-[#111827]"
              }`}
            >
              <Icon
                className="h-5 w-5 shrink-0"
                strokeWidth={isActive ? 2.2 : 2}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
};
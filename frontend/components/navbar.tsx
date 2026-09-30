"use client";

import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

import { MobileNav } from "./mobile-nav";

export const Navbar = () => {
  return (
    <header className="fixed left-0 top-0 z-50 w-full bg-white">
      <div className="flex h-[65px] items-center justify-between border-b border-[#e5e7eb] px-6">
        <Link href="/" className="flex items-center">
          <span className="text-[36px] font-semibold tracking-[-2.5px] text-[#2d6cdf]">
            zoom
          </span>
        </Link>

        <div className="flex items-center gap-5">
          <Link
            href="/"
            className="hidden text-[15px] font-medium text-[#5d6275] hover:text-[#2d6cdf] lg:block"
          >
            Home
          </Link>

          <div className="hidden lg:block">
            <UserButton
              appearance={{
                elements: {
                  userButtonAvatarBox: "h-8 w-8 rounded-[9px]",
                  userButtonAvatar: "h-8 w-8 rounded-[9px]",
                },
              }}
            />
          </div>

          <div className="flex items-center gap-3 lg:hidden">
            <UserButton />
            <MobileNav />
          </div>
        </div>
      </div>
    </header>
  );
};
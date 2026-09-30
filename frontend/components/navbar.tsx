"use client";

import { UserButton } from "@clerk/nextjs";
import { HelpCircle, Settings as SettingsIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCurrentUser } from "@/hooks/use-current-user";

import { MobileNav } from "./mobile-nav";

export const Navbar = () => {
  const { user, isDefaultUser } = useCurrentUser();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const displayName = user?.fullName || user?.firstName || "Alex Morgan";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <>
      <header className="fixed left-0 top-0 z-50 w-full bg-white">
        <div className="flex h-[65px] items-center justify-between border-b border-[#e5e7eb] px-6">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center">
              <span className="text-[36px] font-semibold tracking-[-2.5px] text-[#2d6cdf]">
                zoom
              </span>
            </Link>

            <nav className="hidden items-center gap-6 lg:flex">
              <Link
                href="/"
                className="text-[14px] font-medium text-[#4b5563] transition hover:text-[#2d6cdf]"
              >
                Dashboard
              </Link>
              <Link
                href="/upcoming"
                className="text-[14px] font-medium text-[#4b5563] transition hover:text-[#2d6cdf]"
              >
                Upcoming
              </Link>
              <Link
                href="/previous"
                className="text-[14px] font-medium text-[#4b5563] transition hover:text-[#2d6cdf]"
              >
                Previous
              </Link>
              <Link
                href="/personal-room"
                className="text-[14px] font-medium text-[#4b5563] transition hover:text-[#2d6cdf]"
              >
                Personal Room
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            {/* Settings Placeholder */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              aria-label="Settings"
              title="Settings"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-[#5f6675] transition hover:bg-[#f3f4f6] hover:text-[#111827]"
            >
              <SettingsIcon className="h-5 w-5" />
            </button>

            {/* Help Placeholder */}
            <button
              onClick={() => setIsHelpOpen(true)}
              aria-label="Support & Help"
              title="Help & Information"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-[#5f6675] transition hover:bg-[#f3f4f6] hover:text-[#111827]"
            >
              <HelpCircle className="h-5 w-5" />
            </button>

            {/* Profile area */}
            {!isDefaultUser ? (
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
            ) : (
              <div className="hidden items-center gap-2.5 lg:flex">
                <div
                  title={`Logged in as ${displayName} (Default User Mode)`}
                  className="flex items-center gap-2 rounded-full border border-[#e5e7eb] bg-[#f8fafc] py-1 pl-1 pr-3"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#2d6cdf] text-xs font-semibold text-white">
                    {initials}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-semibold leading-tight text-[#111827]">
                      {displayName}
                    </span>
                    <span className="text-[10px] font-medium leading-none text-[#10b981]">
                      Default Host
                    </span>
                  </div>
                </div>

                <Link
                  href="/sign-in"
                  className="rounded-lg border border-[#2d6cdf] px-3 py-1.5 text-xs font-semibold text-[#2d6cdf] transition hover:bg-[#2d6cdf] hover:text-white"
                >
                  Sign In (Clerk)
                </Link>
              </div>
            )}

            <div className="flex items-center gap-2 lg:hidden">
              {!isDefaultUser ? (
                <UserButton />
              ) : (
                <Link
                  href="/sign-in"
                  className="rounded-md border border-[#2d6cdf] px-2.5 py-1 text-xs font-medium text-[#2d6cdf]"
                >
                  Sign In
                </Link>
              )}
              <MobileNav />
            </div>
          </div>
        </div>
      </header>

      {/* Settings Dialog (Zoom Placeholders) */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="max-w-[480px] rounded-2xl border border-[#e7eaf0] bg-white p-6 text-[#111827] shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[#111827]">
              Settings
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4 flex flex-col gap-4 text-sm">
            <div className="rounded-xl border border-[#e5e7eb] bg-[#f8fafc] p-4">
              <h4 className="font-semibold text-[#111827]">Video & Audio</h4>
              <p className="mt-1 text-xs text-[#5f6675]">
                Integrated with ZEGOCLOUD WebRTC Media Engine. Camera, microphone, and noise suppression auto-configured for active meetings.
              </p>
            </div>
            <div className="rounded-xl border border-[#e5e7eb] bg-[#f8fafc] p-4">
              <h4 className="font-semibold text-[#111827]">General & Meetings</h4>
              <p className="mt-1 text-xs text-[#5f6675]">
                Join with mic muted, copy invite links automatically on creation, and host controls active for moderators.
              </p>
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="rounded-lg bg-[#2d6cdf] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#245bc2]"
              >
                Done
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Help Dialog */}
      <Dialog open={isHelpOpen} onOpenChange={setIsHelpOpen}>
        <DialogContent className="max-w-[480px] rounded-2xl border border-[#e7eaf0] bg-white p-6 text-[#111827] shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[#111827]">
              Zoom Clone Help & Info
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4 flex flex-col gap-3 text-sm text-[#4b5563]">
            <p>
              <strong>Instant Meetings:</strong> Click &ldquo;Host&rdquo; or &ldquo;New Meeting&rdquo; to spin up a live WebRTC room immediately.
            </p>
            <p>
              <strong>Join Meetings:</strong> Enter a 10-digit Meeting ID or invite URL and customize your display name.
            </p>
            <p>
              <strong>Schedule Meetings:</strong> Select date, time, and duration to book upcoming calls.
            </p>
            <p>
              <strong>Host Controls:</strong> As the host, click &ldquo;Participants&rdquo; inside the meeting room to access Mute All and Remove Participant controls.
            </p>
            <div className="flex justify-end pt-3">
              <button
                onClick={() => setIsHelpOpen(false)}
                className="rounded-lg bg-[#2d6cdf] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#245bc2]"
              >
                Close
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
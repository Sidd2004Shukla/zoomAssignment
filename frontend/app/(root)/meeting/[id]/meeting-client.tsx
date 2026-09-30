"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { Loader } from "@/components/loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MeetingRoom } from "@/components/meeting-room";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useGetCallById } from "@/hooks/use-get-call-by-id";

type MeetingClientProps = {
  id?: string;
};

export default function MeetingClient({ id: propId }: MeetingClientProps) {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const id = propId || (params?.id as string) || "";

  const { call, isCallLoading } = useGetCallById(id);
  const { user } = useCurrentUser();

  const [hasConfirmedJoin, setHasConfirmedJoin] = useState(false);
  const [customName, setCustomName] = useState(
    searchParams?.get("name") ||
      (typeof window !== "undefined" && sessionStorage.getItem("zoom_display_name")) ||
      user?.fullName ||
      user?.firstName ||
      "Guest Attendee"
  );

  if (isCallLoading) return <Loader />;

  // Validate meeting existence
  if (!call) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8fafc] p-6 text-[#111827]">
        <section className="max-w-md rounded-2xl border border-[#e7eaf0] bg-white p-8 text-center shadow-lg">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fee2e2] text-xl font-bold text-[#ef4444]">
            !
          </div>
          <h1 className="mt-4 text-2xl font-bold text-[#111827]">Meeting Not Found</h1>
          <p className="mt-2 text-sm text-[#5f6675]">
            The Meeting ID or link you entered does not exist or has already concluded.
          </p>

          <Button
            className="mt-6 w-full bg-[#2d6cdf] font-semibold text-white hover:bg-[#245bc2]"
            onClick={() => router.push("/")}
          >
            Return to Dashboard
          </Button>
        </section>
      </main>
    );
  }

  // Pre-join lobby (Zoom Enter Display Name & Preview)
  const isDirectJoin = searchParams?.has("name") || searchParams?.has("personal");

  if (!hasConfirmedJoin && !isDirectJoin) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8fafc] p-6 text-[#111827]">
        <section className="w-full max-w-md rounded-2xl border border-[#e7eaf0] bg-white p-8 shadow-xl">
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold tracking-[-1.5px] text-[#2d6cdf]">zoom</span>
          </div>

          <h2 className="mt-4 text-xl font-bold text-[#111827]">
            Ready to join &ldquo;{call.title || "Meeting"}&rdquo;?
          </h2>
          <p className="mt-1 text-xs text-[#5f6675]">
            Meeting ID: <span className="font-mono font-medium text-[#111827]">{call.meeting_code || call.id}</span>
          </p>

          <div className="mt-5 flex flex-col gap-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[#4b5563]">
                Your Display Name
              </label>
              <Input
                placeholder="Enter your name"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="mt-1.5 border border-[#d1d5db] bg-white text-[#111827] focus-visible:ring-1 focus-visible:ring-[#2d6cdf]"
              />
            </div>

            <Button
              className="mt-3 w-full bg-[#2d6cdf] py-2.5 font-semibold text-white hover:bg-[#245bc2]"
              onClick={() => {
                if (typeof window !== "undefined") {
                  sessionStorage.setItem("zoom_display_name", customName.trim() || "Guest");
                }
                setHasConfirmedJoin(true);
              }}
            >
              Join Meeting
            </Button>

            <Button
              variant="outline"
              className="w-full border-[#d7dce5] bg-white text-[#26344d] hover:bg-[#f6f8fa]"
              onClick={() => router.push("/")}
            >
              Cancel
            </Button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="w-full bg-[#0b1635] text-white">
      <MeetingRoom meeting={call} />
    </main>
  );
}

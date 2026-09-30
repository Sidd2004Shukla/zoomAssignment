"use client";

import { useRouter } from "next/navigation";

import { useGetCalls } from "@/hooks/use-get-calls";
import type { Meeting } from "@/lib/api/types";

import { Loader } from "./loader";
import { MeetingCard } from "./meeting-card";

type CallListType = {
  type: "ended" | "upcoming";
};

export const CallList = ({ type }: CallListType) => {
  const router = useRouter();
  const { endedCalls, upcomingCalls, isLoading } = useGetCalls();

  const calls = type === "ended" ? endedCalls : upcomingCalls;
  const noCallsMessage =
    type === "ended" ? "No previous meetings." : "No upcoming meetings.";

  if (isLoading) return <Loader />;

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
      {calls && calls.length > 0 ? (
        calls.map((call: Meeting, i) => {
          const code = call.meeting_code || call.id;
          const origin =
            typeof window !== "undefined"
              ? window.location.origin
              : process.env.NEXT_PUBLIC_BASE_URL || "";

          return (
            <MeetingCard
              key={call.id || i}
              title={call.title || "Meeting"}
              meetingCode={code}
              date={
                call.scheduled_start_at
                  ? new Date(call.scheduled_start_at).toLocaleString()
                  : new Date(call.created_at).toLocaleString()
              }
              isPreviousMeeting={type === "ended"}
              buttonText="Join"
              handleClick={() => router.push(`/meeting/${code}`)}
              link={`${origin}/meeting/${code}`}
            />
          );
        })
      ) : (
        <div className="col-span-full rounded-2xl border border-[#e5e7eb] bg-white p-10 text-center shadow-sm">
          <p className="text-base font-semibold text-[#5f6675]">
            {noCallsMessage}
          </p>
        </div>
      )}
    </div>
  );
};

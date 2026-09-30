"use client";

import { useRouter } from "next/navigation";

import { useGetCalls } from "@/hooks/use-get-calls";
import type { Meeting } from "@/lib/api/types";

import { Loader } from "./loader";
import { MeetingCard } from "./meeting-card";

type CallListType = {
  type: "ended" | "upcoming" | "recordings";
};

export const CallList = ({ type }: CallListType) => {
  const router = useRouter();
  const { endedCalls, upcomingCalls, isLoading } = useGetCalls();

  const getCalls = () => {
    switch (type) {
      case "ended":
        return endedCalls;

      case "recordings":
        return [];

      case "upcoming":
        return upcomingCalls;

      default:
        return [];
    }
  };

  const getNoCallsMessage = () => {
    switch (type) {
      case "ended":
        return "No previous calls.";

      case "recordings":
        return "No recordings.";

      case "upcoming":
        return "No upcoming calls.";

      default:
        return "No calls.";
    }
  };

  const calls = getCalls();
  const noCallsMessage = getNoCallsMessage();

  if (isLoading) return <Loader />;

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
      {calls && calls.length > 0 ? (
        calls.map((call: Meeting, i) => (
          <MeetingCard
            key={call.id || i}
            title={call.title.substring(0, 26) || "Personal meeting"}
            date={
              call.scheduled_start_at
                ? new Date(call.scheduled_start_at).toLocaleString()
                : new Date(call.created_at).toLocaleString()
            }
            icon={
              type === "ended"
                ? "/icons/previous.svg"
                : type === "upcoming"
                  ? "/icons/upcoming.svg"
                  : "/icons/recordings.svg"
            }
            isPreviousMeeting={type === "ended"}
            buttonText={type === "recordings" ? "Open" : "Start"}
            handleClick={() =>
              router.push(`/meeting/${call.meeting_code || call.id}`)
            }
            link={
              typeof window !== "undefined"
                ? `${window.location.origin}/meeting/${call.meeting_code || call.id}`
                : `/meeting/${call.meeting_code || call.id}`
            }
          />
        ))
      ) : (
        <h1 className="text-xl font-semibold text-[#5f6675]">{noCallsMessage}</h1>
      )}
    </div>
  );
};

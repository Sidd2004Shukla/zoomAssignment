"use client";

import { CalendarDays, Plus, Video } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import Image from "next/image";

import { MeetingTypeList } from "@/components/meeting-type-list";
import { useGetCalls } from "@/hooks/use-get-calls";

type MeetingState =
  | "isScheduleMeeting"
  | "isJoiningMeeting"
  | "isInstantMeeting"
  | undefined;

const HomePage = () => {
  const { user } = useUser();
  const { upcomingCalls } = useGetCalls();

  const [meetingAction, setMeetingAction] =
    useState<MeetingState>(undefined);

  const name = user?.fullName || user?.firstName || "User";
  const initial = name.charAt(0).toUpperCase();

  const nextMeeting = upcomingCalls?.[0];

  const meetingTime = nextMeeting?.scheduled_start_at
    ? new Date(nextMeeting.scheduled_start_at).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  const handleSchedule = () => {
    setMeetingAction("isScheduleMeeting");
  };

  const handleJoin = () => {
    setMeetingAction("isJoiningMeeting");
  };

  const handleHost = () => {
    setMeetingAction("isInstantMeeting");
  };

  return (
    <>
      <section className="min-h-[calc(100vh-105px)] bg-white text-[#0b1635]">
        <div className="mx-auto max-w-[1180px] px-6 py-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_330px]">
            <div className="flex flex-col gap-8">
              <div className="flex min-h-[130px] items-center rounded-xl border border-[#e7eaf0] bg-white px-7 py-6 shadow-[0_4px_18px_rgba(0,0,0,0.06)]">
                <div className="flex items-center gap-4">
                  <div className="flex h-[78px] w-[78px] shrink-0 items-center justify-center rounded-2xl bg-[#f26f3d] text-4xl font-medium text-white">
                    {initial}
                  </div>

                  <div>
                    <h1 className="text-[25px] font-semibold leading-tight text-[#111827]">
                      {name}
                    </h1>

                    <p className="mt-1 text-[15px] text-[#5f6675]">
                      Plan:{" "}
                      <span className="font-medium text-[#111827]">
                        Basic
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-[#e7eaf0] bg-white p-7 shadow-[0_4px_18px_rgba(0,0,0,0.06)]">
                <div className="flex flex-col justify-between gap-8 md:flex-row md:items-center">
                  <div>
                    <div className="mb-4 flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#2d6cdf] text-[9px] font-bold text-white">
                        Z
                      </div>

                      <span className="text-[19px] font-semibold text-[#3264d8]">
                        Meetings
                      </span>
                    </div>

                    <h2 className="text-[27px] font-semibold leading-tight text-[#111827]">
                      Your meetings are ready
                    </h2>

                    <p className="mt-3 max-w-[480px] text-[15px] leading-6 text-[#697386]">
                      Start an instant meeting, schedule a meeting, or join an
                      existing meeting from your dashboard.
                    </p>

                    <div className="mt-6 flex flex-wrap gap-3">
                      <button
                        onClick={handleSchedule}
                        className="rounded-lg bg-[#2d6cdf] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#245bc2]"
                      >
                        Schedule
                      </button>

                      <button
                        onClick={handleJoin}
                        className="rounded-lg border border-[#d7dce5] bg-white px-5 py-2.5 text-sm font-semibold text-[#26344d] transition hover:bg-[#f6f8fa]"
                      >
                        Join
                      </button>

                      <button
                        onClick={handleHost}
                        className="rounded-lg border border-[#d7dce5] bg-white px-5 py-2.5 text-sm font-semibold text-[#26344d] transition hover:bg-[#f6f8fa]"
                      >
                        Host
                      </button>
                    </div>
                  </div>

                  <div className="hidden h-[150px] w-[210px] shrink-0 items-center justify-center rounded-xl bg-[#edf3ff] md:flex">
                    <div className="text-center">
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#2d6cdf] text-2xl font-bold text-white">
                        Z
                      </div>

                      <p className="mt-3 text-sm font-medium text-[#3264d8]">
                        Meetings
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-[#e7eaf0] bg-white p-7 shadow-[0_4px_18px_rgba(0,0,0,0.06)]">
                <div className="border-b border-[#edf0f4] pb-5">
                  <h2 className="text-[24px] font-semibold text-[#111827]">
                    Recent activity
                  </h2>
                </div>

                <div className="flex min-h-[270px] flex-col items-center justify-center">
                  <div className="flex h-[150px] w-[220px] items-center justify-center">
                    <Image
                      src="/icons/no-recent-activity.png"
                      alt="No recent activity"
                      width={220}
                      height={150}
                      className="object-contain"
                    />
                  </div>

                  <p className="mt-5 text-[17px] font-semibold text-[#202938]">
                    No recent activity
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-8">
              <div className="rounded-xl border border-[#e7eaf0] bg-white p-6 shadow-[0_4px_18px_rgba(0,0,0,0.06)]">
                <div className="grid grid-cols-3 gap-4">
                  <button
                    onClick={handleSchedule}
                    className="group flex flex-col items-center"
                  >
                    <div className="flex h-[50px] w-[50px] items-center justify-center rounded-xl bg-[#3272df] text-white transition group-hover:bg-[#2862c5]">
                      <CalendarDays
                        className="h-6 w-6"
                        strokeWidth={2.2}
                      />
                    </div>

                    <span className="mt-3 text-sm font-medium text-[#26344d]">
                      Schedule
                    </span>
                  </button>

                  <button
                    onClick={handleJoin}
                    className="group flex flex-col items-center"
                  >
                    <div className="flex h-[50px] w-[50px] items-center justify-center rounded-xl bg-[#3272df] text-white transition group-hover:bg-[#2862c5]">
                      <Plus className="h-7 w-7" strokeWidth={2.5} />
                    </div>

                    <span className="mt-3 text-sm font-medium text-[#26344d]">
                      Join
                    </span>
                  </button>

                  <button
                    onClick={handleHost}
                    className="group flex flex-col items-center"
                  >
                    <div className="flex h-[50px] w-[50px] items-center justify-center rounded-xl bg-[#ef793b] text-white transition group-hover:bg-[#dd6730]">
                      <Video className="h-6 w-6" strokeWidth={2.2} />
                    </div>

                    <span className="mt-3 text-sm font-medium text-[#26344d]">
                      Host
                    </span>
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-[#e7eaf0] bg-white p-6 shadow-[0_4px_18px_rgba(0,0,0,0.06)]">
                <h2 className="text-[23px] font-semibold text-[#111827]">
                  Meetings
                </h2>

                <div className="mt-5 rounded-xl bg-[#f6f8fa] px-4 py-3">
                  {nextMeeting ? (
                    <div>
                      <p className="text-sm font-semibold text-[#202938]">
                        Upcoming meeting
                      </p>

                      {meetingTime && (
                        <p className="mt-1 text-sm text-[#697386]">
                          Starts at {meetingTime}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm font-semibold text-[#202938]">
                      No Upcoming Meetings
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <MeetingTypeList
        showCards={false}
        externalMeetingState={meetingAction}
        onExternalClose={() => setMeetingAction(undefined)}
      />
    </>
  );
};

export default HomePage;
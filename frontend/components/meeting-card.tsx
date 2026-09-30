"use client";

import { CalendarDays, Copy, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

type MeetingCardProps = {
  title: string;
  date: string;
  meetingCode?: string;
  isPreviousMeeting?: boolean;
  buttonText?: string;
  handleClick: () => void;
  link: string;
};

export const MeetingCard = ({
  title,
  date,
  meetingCode,
  isPreviousMeeting,
  buttonText = "Join",
  handleClick,
  link,
}: MeetingCardProps) => {
  const { toast } = useToast();

  return (
    <section className="flex flex-col justify-between rounded-2xl border border-[#e5e7eb] bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#eaf2ff] text-[#2d6cdf]">
              {isPreviousMeeting ? (
                <CalendarDays className="h-5 w-5" />
              ) : (
                <Video className="h-5 w-5" />
              )}
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#111827]">{title}</h1>
              <p className="text-xs text-[#5f6675]">{date}</p>
            </div>
          </div>

          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              isPreviousMeeting
                ? "bg-[#f3f4f6] text-[#4b5563]"
                : "bg-[#eaf2ff] text-[#2d6cdf]"
            }`}
          >
            {isPreviousMeeting ? "Ended" : "Upcoming"}
          </span>
        </div>

        {meetingCode && (
          <div className="flex items-center gap-2 rounded-lg bg-[#f8fafc] px-3 py-2 text-xs text-[#5f6675]">
            <span>Meeting Code:</span>
            <span className="font-mono font-semibold text-[#111827]">
              {meetingCode}
            </span>
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-[#f1f5f9] pt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            navigator.clipboard.writeText(link);
            toast({
              title: "Link copied to clipboard.",
              description: link,
            });
          }}
          className="border-[#d7dce5] bg-white text-xs font-semibold text-[#26344d] hover:bg-[#f6f8fa]"
        >
          <Copy className="mr-1.5 h-3.5 w-3.5" />
          Copy Link
        </Button>

        <Button
          size="sm"
          onClick={handleClick}
          className="bg-[#2d6cdf] text-xs font-semibold text-white hover:bg-[#245bc2]"
        >
          {isPreviousMeeting ? "Join Again" : buttonText}
        </Button>
      </div>
    </section>
  );
};

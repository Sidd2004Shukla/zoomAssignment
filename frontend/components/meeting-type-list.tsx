"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ReactDatePicker from "react-datepicker";

import { MeetingModal } from "@/components/modals/meeting-modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { createMeeting as createBackendMeeting } from "@/lib/api/meetings";

import { HomeCard } from "./home-card";
import { Loader } from "./loader";

type MeetingState =
  | "isScheduleMeeting"
  | "isJoiningMeeting"
  | "isInstantMeeting"
  | undefined;

export const MeetingTypeList = () => {
  const router = useRouter();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [meetingLink, setMeetingLink] = useState<string>();
  const [meetingState, setMeetingState] = useState<MeetingState>(undefined);
  const [values, setValues] = useState({
    dateTime: new Date(),
    description: "",
    link: "",
  });

  const { user } = useUser();

  const handleCreateMeeting = async () => {
    if (!user || !user?.id) return;

    try {
      setIsLoading(true);

      if (!values.dateTime) {
        return toast({
          title: "Please select a date and time.",
          variant: "destructive",
        });
      }

      const meeting = await createBackendMeeting({
        host_user_id: user.id,
        title: values.description || "Instant meeting",
        description: values.description || "Instant meeting",
        meeting_code: crypto.randomUUID(),
        scheduled_start_at: values.dateTime.toISOString(),
        settings: {},
      });

      setMeetingLink(`${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${meeting.id}`);

      if (!values?.description) {
        router.push(`/meeting/${meeting.id}`);
      }

      toast({
        title: "Meeting created.",
      });
    } catch (error) {
      console.error("CREATE_MEETING: ", error);

      toast({
        title: "Failed to create meeting.",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || !user?.id) return <Loader />;

  return (
    <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
      <HomeCard
        img="/icons/add-meeting.svg"
        title="New Meeting"
        description="Start an instant meeting"
        handleClick={() => setMeetingState("isInstantMeeting")}
        className="bg-orange-1"
      />

      <HomeCard
        img="/icons/schedule.svg"
        title="Schedule Meeting"
        description="Plan your meeting"
        handleClick={() => setMeetingState("isScheduleMeeting")}
        className="bg-blue-1"
      />

      <HomeCard
        img="/icons/recordings.svg"
        title="View Recordings"
        description="Check out your recordings"
        handleClick={() => router.push("/recordings")}
        className="bg-purple-1"
      />

      <HomeCard
        img="/icons/join-meeting.svg"
        title="Join Meeting"
        description="Via invitation link"
        handleClick={() => setMeetingState("isJoiningMeeting")}
        className="bg-yellow-1"
      />

      {!meetingLink ? (
        <MeetingModal
          isOpen={meetingState === "isScheduleMeeting"}
          onClose={() => setMeetingState(undefined)}
          title="Create meeting"
          handleClick={handleCreateMeeting}
          isLoading={isLoading}
        >
          <div className="flex flex-col gap-2.5">
            <label className="text-normal text-base leading-[22px] text-sky-2">
              Add a description
              <Textarea
                rows={6}
                placeholder="Add a description..."
                className="mt-2 resize-none border-none bg-dark-3"
                onChange={(e) => {
                  setValues({ ...values, description: e.target.value });
                }}
              />
            </label>
          </div>

          <div className="flex w-full flex-col gap-2.5">
            <label className="text-normal flex flex-col text-base leading-[22px] text-sky-2">
              Select Date and Time
              <ReactDatePicker
                selected={values.dateTime}
                onChange={(date) =>
                  setValues({
                    ...values,
                    dateTime: date!,
                  })
                }
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                timeCaption="time"
                dateFormat="MMMM d, yyyy h:mm aa"
                className="mt-2 w-full rounded bg-dark-3 p-2"
              />
            </label>
          </div>
        </MeetingModal>
      ) : (
        <MeetingModal
          isOpen={meetingState === "isScheduleMeeting"}
          onClose={() => setMeetingState(undefined)}
          title="Meeting created"
          className="text-center"
          buttonText="Copy meeting link"
          handleClick={() => {
            navigator.clipboard.writeText(meetingLink);

            toast({ title: "Link copied." });
          }}
          image="/icons/checked.svg"
          buttonIcon="/icons/copy.svg"
          isLoading={isLoading}
        />
      )}

      <MeetingModal
        isOpen={meetingState === "isInstantMeeting"}
        onClose={() => setMeetingState(undefined)}
        title="Start an instant meeting"
        className="text-center"
        buttonText="Start Meeting"
          handleClick={handleCreateMeeting}
        isLoading={isLoading}
      />

      <MeetingModal
        isOpen={meetingState === "isJoiningMeeting"}
        onClose={() => setMeetingState(undefined)}
        title="Type the link here"
        className="text-center"
        buttonText="Join Meeting"
        handleClick={() => {
          if (!values.link) return;
          const trimmed = values.link.trim();
          if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
            try {
              const url = new URL(trimmed);
              router.push(url.pathname + url.search);
            } catch {
              router.push(trimmed);
            }
          } else if (trimmed.startsWith("/")) {
            router.push(trimmed);
          } else {
            router.push(`/meeting/${trimmed}`);
          }
        }}
        isLoading={isLoading}
      >
        <Input
          placeholder="Meeting link or ID"
          onChange={(e) => setValues({ ...values, link: e.target.value })}
          className="border-none bg-dark-3"
        />
      </MeetingModal>
    </section>
  );
};

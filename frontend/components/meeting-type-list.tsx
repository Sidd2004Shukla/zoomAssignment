"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ReactDatePicker from "react-datepicker";

import { MeetingModal } from "@/components/modals/meeting-modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { createMeeting as createBackendMeeting } from "@/lib/api/meetings";

import { generateMeetingCode } from "@/lib/utils";

import { HomeCard } from "./home-card";
import { Loader } from "./loader";

type MeetingState =
  | "isScheduleMeeting"
  | "isJoiningMeeting"
  | "isInstantMeeting"
  | undefined;

type MeetingTypeListProps = {
  showCards?: boolean;
  externalMeetingState?: MeetingState;
  onExternalClose?: () => void;
};

export const MeetingTypeList = ({
  showCards = true,
  externalMeetingState,
  onExternalClose,
}: MeetingTypeListProps) => {
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

  useEffect(() => {
    if (externalMeetingState) {
      setMeetingState(externalMeetingState);
    }
  }, [externalMeetingState]);

  const closeMeetingModal = () => {
    setMeetingState(undefined);
    setMeetingLink(undefined);
    setValues((prev) => ({ ...prev, description: "", link: "" }));
    onExternalClose?.();
  };

  const handleCreateMeeting = async () => {
    if (!user || !user.id) return;

    try {
      setIsLoading(true);

      const hostName =
        user.fullName ||
        user.firstName ||
        user.username ||
        undefined;

      const meetingCode = generateMeetingCode();
      const origin =
        typeof window !== "undefined"
          ? window.location.origin
          : process.env.NEXT_PUBLIC_BASE_URL || "";

      if (meetingState === "isInstantMeeting") {
        const meeting = await createBackendMeeting({
          host_user_id: user.id,
          host_name: hostName,
          title: "Instant meeting",
          description: "Instant meeting",
          meeting_code: meetingCode,
          status: "ACTIVE",
          started_at: new Date().toISOString(),
          scheduled_start_at: new Date().toISOString(),
          settings: {},
        });

        toast({
          title: "Instant meeting started",
        });

        router.push(`/meeting/${meeting.meeting_code || meeting.id}`);
        return;
      }

      // Scheduled meeting flow
      if (!values.dateTime) {
        return toast({
          title: "Please select a date and time.",
          variant: "destructive",
        });
      }

      const meeting = await createBackendMeeting({
        host_user_id: user.id,
        host_name: hostName,
        title: values.description || "Scheduled meeting",
        description: values.description || "Scheduled meeting",
        meeting_code: meetingCode,
        status: "SCHEDULED",
        scheduled_start_at: values.dateTime.toISOString(),
        settings: {},
      });

      const fullLink = `${origin}/meeting/${meeting.meeting_code || meeting.id}`;
      setMeetingLink(fullLink);

      toast({
        title: "Meeting scheduled successfully.",
      });
    } catch (error) {
      console.error("CREATE_MEETING: ", error);

      toast({
        title: "Failed to create meeting.",
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinMeeting = () => {
    if (!values.link) return;

    let input = values.link.trim();
    if (!input) return;

    input = input.replace(/\/+$/, "");

    if (
      !input.startsWith("http://") &&
      !input.startsWith("https://") &&
      (input.includes("localhost") ||
        input.includes(".vercel.app") ||
        input.includes("/meeting/"))
    ) {
      input = `https://${input}`;
    }

    if (input.startsWith("http://") || input.startsWith("https://")) {
      try {
        const url = new URL(input);
        const match = url.pathname.match(/\/meeting\/([^/?#]+)/);
        if (match && match[1]) {
          router.push(`/meeting/${match[1]}`);
          return;
        }
        router.push(url.pathname + url.search);
        return;
      } catch {
        // ignore and fallback
      }
    }

    if (input.startsWith("/meeting/")) {
      router.push(input);
      return;
    }

    router.push(`/meeting/${encodeURIComponent(input)}`);
  };

  if (!user || !user.id) {
    return <Loader />;
  }

  return (
    <>
      {showCards && (
        <section className="grid grid-cols-1 gap-5 md:grid-cols-3">
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
            img="/icons/join-meeting.svg"
            title="Join Meeting"
            description="Via invitation link"
            handleClick={() => setMeetingState("isJoiningMeeting")}
            className="bg-yellow-1"
          />
        </section>
      )}

      {!meetingLink ? (
        <MeetingModal
          isOpen={meetingState === "isScheduleMeeting"}
          onClose={closeMeetingModal}
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
                  setValues({
                    ...values,
                    description: e.target.value,
                  });
                }}
              />
            </label>
          </div>

          <div className="flex w-full flex-col gap-2.5">
            <label className="text-normal flex flex-col text-base leading-[22px] text-sky-2">
              Select Date and Time

              <ReactDatePicker
                selected={values.dateTime}
                onChange={(date) => {
                  setValues({
                    ...values,
                    dateTime: date!,
                  });
                }}
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
          onClose={closeMeetingModal}
          title="Meeting created"
          className="text-center"
          buttonText="Copy meeting link"
          handleClick={() => {
            navigator.clipboard.writeText(meetingLink);

            toast({
              title: "Link copied.",
            });
          }}
          image="/icons/checked.svg"
          buttonIcon="/icons/copy.svg"
          isLoading={isLoading}
        />
      )}

      <MeetingModal
        isOpen={meetingState === "isInstantMeeting"}
        onClose={closeMeetingModal}
        title="Start an instant meeting"
        className="text-center"
        buttonText="Start Meeting"
        handleClick={handleCreateMeeting}
        isLoading={isLoading}
      />

      <MeetingModal
        isOpen={meetingState === "isJoiningMeeting"}
        onClose={closeMeetingModal}
        title="Type the link here"
        className="text-center"
        buttonText="Join Meeting"
        handleClick={handleJoinMeeting}
        isLoading={isLoading}
      >
        <Input
          placeholder="Meeting link or ID"
          value={values.link}
          onChange={(e) => {
            setValues({
              ...values,
              link: e.target.value,
            });
          }}
          className="border-none bg-dark-3"
        />
      </MeetingModal>
    </>
  );
};
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ReactDatePicker from "react-datepicker";

import { MeetingModal } from "@/components/modals/meeting-modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useCurrentUser } from "@/hooks/use-current-user";
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
  const { user, isLoaded } = useCurrentUser();

  const [isLoading, setIsLoading] = useState(false);
  const [meetingLink, setMeetingLink] = useState<string>();
  const [meetingState, setMeetingState] = useState<MeetingState>(undefined);

  const [values, setValues] = useState({
    title: "",
    description: "",
    dateTime: new Date(Date.now() + 15 * 60 * 1000), // Default +15 mins from now
    durationMinutes: 30,
    link: "",
    displayName: "",
  });

  useEffect(() => {
    if (externalMeetingState) {
      setMeetingState(externalMeetingState);
    }
  }, [externalMeetingState]);

  useEffect(() => {
    if (user && !values.displayName) {
      setValues((prev) => ({
        ...prev,
        displayName: user.fullName || user.firstName || "Guest",
      }));
    }
  }, [user, values.displayName]);

  const closeMeetingModal = () => {
    setMeetingState(undefined);
    setMeetingLink(undefined);
    setValues((prev) => ({
      ...prev,
      title: "",
      description: "",
      link: "",
    }));
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
        "Alex Morgan";

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
          description: "Instant meeting started from dashboard",
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

      const scheduledStart = values.dateTime;
      const scheduledEnd = new Date(
        scheduledStart.getTime() + (values.durationMinutes || 30) * 60 * 1000
      );

      const meetingTitle = values.title.trim() || "Scheduled Zoom Meeting";

      const meeting = await createBackendMeeting({
        host_user_id: user.id,
        host_name: hostName,
        title: meetingTitle,
        description: values.description.trim() || meetingTitle,
        meeting_code: meetingCode,
        status: "SCHEDULED",
        scheduled_start_at: scheduledStart.toISOString(),
        scheduled_end_at: scheduledEnd.toISOString(),
        settings: {
          duration_minutes: values.durationMinutes,
        },
      });

      const fullLink = `${origin}/meeting/${meeting.meeting_code || meeting.id}`;
      setMeetingLink(fullLink);

      toast({
        title: "Meeting scheduled successfully",
        description: `Scheduled for ${scheduledStart.toLocaleDateString()} at ${scheduledStart.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
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
    let input = values.link.trim();
    if (!input) {
      toast({
        title: "Please enter a Meeting ID or invite link",
        variant: "destructive",
      });
      return;
    }

    // Save customized display name in session storage
    const enteredName = values.displayName.trim() || user?.fullName || "Guest";
    if (typeof window !== "undefined") {
      sessionStorage.setItem("zoom_display_name", enteredName);
    }

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

    const nameParam = `name=${encodeURIComponent(enteredName)}`;

    if (input.startsWith("http://") || input.startsWith("https://")) {
      try {
        const url = new URL(input);
        const match = url.pathname.match(/\/meeting\/([^/?#]+)/);
        if (match && match[1]) {
          const sep = url.search ? "&" : "?";
          router.push(`/meeting/${match[1]}${url.search}${sep}${nameParam}`);
          return;
        }
        router.push(url.pathname + url.search);
        return;
      } catch {
        // ignore and fallback
      }
    }

    if (input.startsWith("/meeting/")) {
      const sep = input.includes("?") ? "&" : "?";
      router.push(`${input}${sep}${nameParam}`);
      return;
    }

    router.push(`/meeting/${encodeURIComponent(input)}?${nameParam}`);
  };

  if (!isLoaded || !user) {
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

      {/* Schedule Meeting Modal */}
      {!meetingLink ? (
        <MeetingModal
          isOpen={meetingState === "isScheduleMeeting"}
          onClose={closeMeetingModal}
          title="Schedule a Meeting"
          handleClick={handleCreateMeeting}
          isLoading={isLoading}
          buttonText="Schedule Meeting"
        >
          <div className="flex flex-col gap-4 text-left">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[#4b5563]">
                Meeting Topic / Title
              </label>
              <Input
                placeholder="e.g. Product Architecture Review"
                value={values.title}
                className="mt-1.5 border border-[#d1d5db] bg-white text-[#111827] focus-visible:ring-1 focus-visible:ring-[#2d6cdf]"
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, title: e.target.value }))
                }
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[#4b5563]">
                Description / Agenda (Optional)
              </label>
              <Textarea
                rows={3}
                placeholder="Meeting details, agenda, and topics..."
                className="mt-1.5 resize-none border border-[#d1d5db] bg-white text-[#111827] focus-visible:ring-1 focus-visible:ring-[#2d6cdf]"
                value={values.description}
                onChange={(e) =>
                  setValues((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-[#4b5563]">
                  Start Date & Time
                </label>
                <div className="mt-1.5">
                  <ReactDatePicker
                    selected={values.dateTime}
                    onChange={(date) => {
                      if (date) {
                        setValues((prev) => ({
                          ...prev,
                          dateTime: date,
                        }));
                      }
                    }}
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={15}
                    timeCaption="Time"
                    dateFormat="MMM d, yyyy h:mm aa"
                    className="w-full rounded-md border border-[#d1d5db] bg-white px-3 py-2 text-sm text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#2d6cdf]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-[#4b5563]">
                  Duration
                </label>
                <select
                  value={values.durationMinutes}
                  onChange={(e) =>
                    setValues((prev) => ({
                      ...prev,
                      durationMinutes: Number(e.target.value),
                    }))
                  }
                  className="mt-1.5 w-full rounded-md border border-[#d1d5db] bg-white px-3 py-2 text-sm text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#2d6cdf]"
                >
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={90}>1.5 hours</option>
                  <option value={120}>2 hours</option>
                </select>
              </div>
            </div>
          </div>
        </MeetingModal>
      ) : (
        <MeetingModal
          isOpen={meetingState === "isScheduleMeeting"}
          onClose={closeMeetingModal}
          title="Meeting Scheduled"
          buttonText="Copy Meeting Link"
          handleClick={() => {
            navigator.clipboard.writeText(meetingLink);
            toast({
              title: "Meeting link copied to clipboard",
              description: meetingLink,
            });
          }}
          isLoading={isLoading}
        >
          <div className="flex flex-col gap-4 text-center">
            <p className="text-sm text-[#5f6675]">
              Your meeting has been scheduled and added to your upcoming meetings.
            </p>
            <div className="flex items-center gap-2 rounded-lg border border-[#e5e7eb] bg-[#f8fafc] p-3 text-left">
              <span className="truncate font-mono text-xs text-[#26344d]">
                {meetingLink}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => router.push(meetingLink)}
                className="w-full rounded-lg bg-[#10b981] py-2.5 text-xs font-semibold text-white transition hover:bg-[#059669]"
              >
                Join Now
              </button>
            </div>
          </div>
        </MeetingModal>
      )}

      {/* Instant Meeting Modal */}
      <MeetingModal
        isOpen={meetingState === "isInstantMeeting"}
        onClose={closeMeetingModal}
        title="Start an Instant Meeting"
        buttonText="Start Meeting"
        handleClick={handleCreateMeeting}
        isLoading={isLoading}
      >
        <p className="text-sm text-[#5f6675]">
          A new meeting will be created instantly and you will be connected with camera and microphone controls.
        </p>
      </MeetingModal>

      {/* Join Meeting Modal */}
      <MeetingModal
        isOpen={meetingState === "isJoiningMeeting"}
        onClose={closeMeetingModal}
        title="Join a Meeting"
        buttonText="Join Meeting"
        handleClick={handleJoinMeeting}
        isLoading={isLoading}
      >
        <div className="flex flex-col gap-4 text-left">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-[#4b5563]">
              Meeting ID or Invite Link
            </label>
            <Input
              placeholder="e.g. 842-192-3841 or https://..."
              value={values.link}
              onChange={(e) => {
                setValues((prev) => ({
                  ...prev,
                  link: e.target.value,
                }));
              }}
              className="mt-1.5 border border-[#d1d5db] bg-white text-[#111827] focus-visible:ring-1 focus-visible:ring-[#2d6cdf]"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-[#4b5563]">
              Your Display Name
            </label>
            <Input
              placeholder="Enter your name"
              value={values.displayName}
              onChange={(e) => {
                setValues((prev) => ({
                  ...prev,
                  displayName: e.target.value,
                }));
              }}
              className="mt-1.5 border border-[#d1d5db] bg-white text-[#111827] focus-visible:ring-1 focus-visible:ring-[#2d6cdf]"
            />
            <p className="mt-1 text-[11px] text-[#6b7280]">
              This name will be visible to everyone in the meeting.
            </p>
          </div>
        </div>
      </MeetingModal>
    </>
  );
};
"use client";

import { useCurrentUser } from "@/hooks/use-current-user";
import { useRouter } from "next/navigation";

import { useEffect } from "react";
import { Loader } from "@/components/loader";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { createMeeting } from "@/lib/api/meetings";
import { getPersonalMeetingCode } from "@/lib/utils";

type TableProps = {
  title: string;
  description: string;
};

const Table = ({ title, description }: TableProps) => (
  <div className="flex flex-col items-start gap-2 rounded-xl border border-[#e5e7eb] bg-white p-4 shadow-sm xl:flex-row xl:items-center">
    <h1 className="text-sm font-medium text-[#5f6675] lg:text-base xl:min-w-36">
      {title}:
    </h1>
    <p className="truncate text-sm font-semibold text-[#111827] max-sm:max-w-[320px] lg:text-base">
      {description}
    </p>
  </div>
);

const PersonalRoomPage = () => {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isLoaded } = useCurrentUser();

  const displayName =
    user?.fullName || user?.username || user?.firstName || "Personal";

  const pmiCode = user?.id ? getPersonalMeetingCode(user.id) : "";
  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_BASE_URL || "";
  const meetingLink = `${origin}/meeting/${pmiCode}?personal=true`;

  useEffect(() => {
    if (!user || !user.id || !isLoaded || !pmiCode) return;

    const initPersonalRoom = async () => {
      try {
        await createMeeting({
          host_user_id: user.id,
          host_name: displayName,
          title: `${displayName}'s Personal Meeting Room`,
          description: `${displayName}'s Personal Meeting Room`,
          meeting_code: pmiCode,
          status: "ACTIVE",
          scheduled_start_at: new Date().toISOString(),
          settings: { personal: true, personal_user_id: user.id },
        });
      } catch {
        // already exists or initialized
      }
    };

    initPersonalRoom();
  }, [user, isLoaded, displayName, pmiCode]);

  if (!user || !user?.id || !isLoaded) return <Loader />;

  const startRoom = async () => {
    try {
      await createMeeting({
        host_user_id: user.id,
        host_name: displayName,
        title: `${displayName}'s Personal Meeting Room`,
        description: `${displayName}'s Personal Meeting Room`,
        meeting_code: pmiCode,
        status: "ACTIVE",
        started_at: new Date().toISOString(),
        scheduled_start_at: new Date().toISOString(),
        settings: { personal: true, personal_user_id: user.id },
      });
    } catch {
      // ignore
    }

    router.push(`/meeting/${pmiCode}?personal=true`);
  };

  return (
    <section className="mx-auto flex size-full max-w-[1180px] flex-col gap-8 px-6 py-8 text-[#111827]">
      <h1 className="text-3xl font-bold">Personal Meeting Room</h1>

      <div className="flex w-full flex-col gap-4 xl:max-w-[900px]">
        <Table title="Meeting ID" description={pmiCode} />
        <Table
          title="Topic"
          description={`${displayName}'s Personal Meeting Room`}
        />
        <Table title="Invite link" description={meetingLink} />
      </div>

      <div className="flex gap-4">
        <Button
          className="bg-[#2d6cdf] px-6 font-semibold text-white hover:bg-[#245bc2]"
          onClick={startRoom}
        >
          Start Meeting
        </Button>

        <Button
          variant="outline"
          className="border-[#d7dce5] bg-white px-6 font-semibold text-[#26344d] hover:bg-[#f6f8fa]"
          onClick={() => {
            navigator.clipboard.writeText(meetingLink);
            toast({
              title: "Link copied to clipboard.",
            });
          }}
        >
          Copy invitation
        </Button>
      </div>
    </section>
  );
};

export default PersonalRoomPage;

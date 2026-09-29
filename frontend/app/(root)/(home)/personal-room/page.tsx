"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

import { Loader } from "@/components/loader";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { createMeeting, getMeetings } from "@/lib/api/meetings";

type TableProps = {
  title: string;
  description: string;
};

const Table = ({ title, description }: TableProps) => (
  <div className="flex flex-col items-start gap-2 xl:flex-row">
    <h1 className="text-base font-medium text-sky-1 lg:text-xl xl:min-w-32">
      {title}:
    </h1>
    <p className="truncate text-sm font-bold max-sm:max-w-[320px] lg:text-xl">
      {description}
    </p>
  </div>
);

const PersonalRoomPage = () => {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isLoaded } = useUser();

  const displayName =
    user?.fullName || user?.username || user?.firstName || "Personal";

  if (!user || !user?.id || !isLoaded) return <Loader />;

  const meetingCode = user.id;
  const meetingLink = `${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${meetingCode}?personal=true`;

  const startRoom = async () => {
    const existingMeetings = await getMeetings();
    const existing = existingMeetings.find(
      (meeting) => meeting.meeting_code === meetingCode
    );

    if (!existing) {
      await createMeeting({
        host_user_id: user.id,
        title: `${displayName}'s Meeting Room`,
        description: `${displayName}'s Meeting Room`,
        meeting_code: meetingCode,
        scheduled_start_at: new Date().toISOString(),
        settings: { personal: true },
      });
    }

    router.push(`/meeting/${meetingCode}?personal=true`);
  };

  return (
    <section className="flex size-full flex-col gap-10 text-white">
      <h1 className="text-3xl font-bold">Personal Room</h1>

      <div className="flex w-full flex-col gap-8 xl:max-w-[900px]">
        <Table title="Meeting ID" description={meetingCode} />
        <Table title="Topic" description={`${displayName}'s Meeting Room`} />
        <Table title="Invite link" description={meetingLink} />
      </div>

      <div className="flex gap-5">
        <Button className="bg-blue-1" onClick={startRoom}>
          Start Meeting
        </Button>

        <Button
          className="bg-dark-3"
          onClick={() => {
            navigator.clipboard.writeText(meetingLink);
            toast({
              title: "Link copied.",
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

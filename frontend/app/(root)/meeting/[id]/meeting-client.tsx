"use client";

import { useParams, useRouter } from "next/navigation";

import { Loader } from "@/components/loader";
import { useGetCallById } from "@/hooks/use-get-call-by-id";
import { Button } from "@/components/ui/button";
import { MeetingRoom } from "@/components/meeting-room";

type MeetingClientProps = {
  id?: string;
};

export default function MeetingClient({ id: propId }: MeetingClientProps) {
  const router = useRouter();
  const params = useParams();
  const id = propId || (params?.id as string) || "";

  const { call, isCallLoading } = useGetCallById(id);

  if (isCallLoading) return <Loader />;

  if (!call) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-dark-2 p-6 text-white">
        <section className="max-w-xl rounded-2xl bg-dark-1 p-8 text-center shadow-lg">
          <h1 className="text-3xl font-bold">Meeting not found</h1>
          <p className="mt-3 text-sky-1">
            The meeting id or code you opened does not exist yet.
          </p>

          <Button className="mt-6 bg-blue-1" onClick={() => router.push("/")}>
            Back home
          </Button>
        </section>
      </main>
    );
  }

  return (
    <main className="w-full bg-dark-2 text-white">
      <MeetingRoom meeting={call} />
    </main>
  );
}

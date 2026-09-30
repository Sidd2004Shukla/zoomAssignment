import { Suspense } from "react";
import { Loader } from "@/components/loader";
import MeetingClient from "./meeting-client";

export default function MeetingIdPage() {
  return (
    <Suspense fallback={<Loader />}>
      <MeetingClient />
    </Suspense>
  );
}

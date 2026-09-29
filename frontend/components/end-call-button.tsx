"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export const EndCallButton = () => {
  const router = useRouter();

  return (
    <div className="">
      <Button
        onClick={() => router.push("/")}
        className="bg-red-500"
      >
        End meeting
      </Button>
    </div>
  );
};

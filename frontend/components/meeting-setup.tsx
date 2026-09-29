"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

type MeetingSetupProps = {
  setIsSetupComplete: (isSetupComplete: boolean) => void;
};

export const MeetingSetup = ({ setIsSetupComplete }: MeetingSetupProps) => {
  const [isMicCamToggledOn, setIsMicCamToggledOn] = useState(false);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4 px-6 text-white">
      <h1 className="text-2xl font-bold">Setup</h1>

      <p className="max-w-xl text-center text-sky-2">
        ZEGOCLOUD setup will replace this shell in the next stage. The current
        screen keeps the existing meeting flow visible while the backend and API
        layer are being wired up.
      </p>

      <label className="flex items-center justify-center gap-2 font-medium">
        <input
          type="checkbox"
          checked={isMicCamToggledOn}
          onChange={(e) => setIsMicCamToggledOn(e.target.checked)}
        />
        Join with mic and camera off
      </label>

      <Button
        className="rounded-md bg-green-500 px-4 py-2.5"
        onClick={() => setIsSetupComplete(true)}
      >
        Join meeting
      </Button>
    </div>
  );
};

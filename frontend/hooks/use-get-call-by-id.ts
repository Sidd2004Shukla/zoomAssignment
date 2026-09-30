import { useEffect, useState } from "react";

import { getMeeting } from "@/lib/api/meetings";
import type { Meeting } from "@/lib/api/types";

export const useGetCallById = (id: string | string[]) => {
  const [call, setCall] = useState<Meeting>();
  const [isCallLoading, setIsCallLoading] = useState(true);

  useEffect(() => {
    const rawId = (Array.isArray(id) ? id[0] : id || "").trim();
    if (!rawId) {
      setIsCallLoading(false);
      return;
    }

    const loadCall = async () => {
      try {
        setCall(await getMeeting(rawId));
      } catch (error) {
        console.error("Failed to load call:", error);
      } finally {
        setIsCallLoading(false);
      }
    };

    loadCall();
  }, [id]);

  return { call, isCallLoading };
};

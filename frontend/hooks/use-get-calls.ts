import { useCallback, useEffect, useState } from "react";

import { getMeetings } from "@/lib/api/meetings";
import type { Meeting } from "@/lib/api/types";

export const useGetCalls = () => {
  const [calls, setCalls] = useState<Meeting[]>();
  const [isLoading, setIsLoading] = useState(false);

  const loadCalls = useCallback(async () => {
    setIsLoading(true);
    try {
      setCalls(await getMeetings());
    } catch (error) {
      console.error("Failed to load calls:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCalls();
  }, [loadCalls]);

  const endedCalls = calls
    ?.filter(({ ended_at, status }) => {
      return status === "ENDED" || status === "CANCELED" || Boolean(ended_at);
    })
    .sort((a, b) => {
      const timeA = new Date(a.ended_at || a.scheduled_start_at || a.created_at).getTime();
      const timeB = new Date(b.ended_at || b.scheduled_start_at || b.created_at).getTime();
      return timeB - timeA;
    });

  const upcomingCalls = calls
    ?.filter(({ ended_at, status, settings }) => {
      if (status === "ENDED" || status === "CANCELED" || ended_at) return false;
      if (settings && (settings as any).personal) return false;
      return status === "SCHEDULED" || status === "ACTIVE";
    })
    .sort((a, b) => {
      const timeA = new Date(a.scheduled_start_at || a.created_at).getTime();
      const timeB = new Date(b.scheduled_start_at || b.created_at).getTime();
      return timeA - timeB;
    });

  return { endedCalls, upcomingCalls, calls, isLoading, reloadCalls: loadCalls };
};

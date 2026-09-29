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

  const now = new Date();

  const endedCalls = calls
    ?.filter(({ scheduled_start_at, ended_at, status }) => {
      if (status === "ENDED" || status === "CANCELED") return true;
      if (ended_at) return true;
      return scheduled_start_at && new Date(scheduled_start_at) < now;
    })
    .sort((a, b) => {
      const timeA = new Date(a.ended_at || a.scheduled_start_at || a.created_at).getTime();
      const timeB = new Date(b.ended_at || b.scheduled_start_at || b.created_at).getTime();
      return timeB - timeA;
    });

  const upcomingCalls = calls
    ?.filter(({ scheduled_start_at, ended_at, status }) => {
      if (status === "ENDED" || status === "CANCELED" || ended_at) return false;
      return scheduled_start_at && new Date(scheduled_start_at) > now;
    })
    .sort((a, b) => {
      const timeA = new Date(a.scheduled_start_at!).getTime();
      const timeB = new Date(b.scheduled_start_at!).getTime();
      return timeA - timeB;
    });

  return { endedCalls, upcomingCalls, calls, isLoading, reloadCalls: loadCalls };
};

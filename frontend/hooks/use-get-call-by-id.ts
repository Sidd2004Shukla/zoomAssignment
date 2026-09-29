import { useEffect, useState } from "react";

import { getMeeting } from "@/lib/api/meetings";
import type { Meeting } from "@/lib/api/types";

export const useGetCallById = (id: string | string[]) => {
  const [call, setCall] = useState<Meeting>();
  const [isCallLoading, setIsCallLoading] = useState(true);

  useEffect(() => {
    const loadCall = async () => {
      try {
        setCall(await getMeeting(Array.isArray(id) ? id[0] : id));
      } catch (error) {
        console.error(error);
      } finally {
        setIsCallLoading(false);
      }
    };

    loadCall();
  }, [id]);

  return { call, isCallLoading };
};

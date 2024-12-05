import { useQuery } from "@tanstack/react-query";
import { APIConfig } from "core/config";

export function useHeartBeatQuery() {
  return useQuery({
    queryKey: ["heartbeat"],
    queryFn: async () => {
      try {
        const req = await fetch(`${APIConfig.apiUrl}/heartbeat`, {
          signal: AbortSignal.timeout(3000),
        });
        return req.ok;
      } catch (_) {
        return false;
      }
    },
    retry: false,
    refetchInterval: 3000,
  });
}

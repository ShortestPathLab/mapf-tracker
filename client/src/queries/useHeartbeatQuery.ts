import { APIConfig } from "core/config";
import { json, text } from "./query";
import { ref } from "yup";
import { useQuery } from "@tanstack/react-query";

export function useHeartBeatQuery() {
  return useQuery({
    queryKey: ["heartbeat"],
    queryFn: async () => {
      try {
        const req = await fetch(`${APIConfig.apiUrl}/heartbeat`, {
          signal: AbortSignal.timeout(3000),
        });
        return req.ok;
      } catch (e) {
        return false;
      }
    },
    retry: false,
    refetchInterval: 3000,
  });
}

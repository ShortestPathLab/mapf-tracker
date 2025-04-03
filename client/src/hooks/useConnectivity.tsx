import { useHeartBeatQuery } from "queries/useHeartbeatQuery";
import useOffline from "use-offline";

export function useConnectivity() {
  const isOffline = useOffline();
  const { data, isLoading } = useHeartBeatQuery();
  return {
    offline: isOffline,
    disconnected: isOffline || (!isLoading && !data),
  };
}

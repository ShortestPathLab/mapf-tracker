import api, { useQuery } from "hooks/useQuery";

export function useHeartBeatQuery() {
  const query = useQuery(
    ["heartbeat"],
    () =>
      api.api.heartbeat.get({
        fetch: { signal: AbortSignal.timeout(10000) },
      }),
    {
      retry: false,
      refetchInterval: 10000,
    },
  );

  return {
    ...query,
    data: query.data === "OK",
  };
}

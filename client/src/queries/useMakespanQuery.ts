import { useQuery } from "@tanstack/react-query";
import api, { unwrap } from "hooks/useQuery";

export type MakespanOptions = {
  instance?: string;
  solutionPath?: string;
};

export const useMakespanData = ({ instance, solutionPath }: MakespanOptions = {}) => {
  const key = ["instance-makespan", instance, solutionPath];
  return useQuery({
    queryKey: key,
    staleTime: Infinity,
    queryFn: ({ signal }) =>
      unwrap(api.api.map.makespan.post({ instance, solutionPath, $fetch: { signal } })),
    enabled: !!(instance || solutionPath),
  });
};

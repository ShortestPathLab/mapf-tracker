import { useQuery } from "@tanstack/react-query";
import { Mutex } from "async-mutex";
import { queryClient } from "App";
import api, { unwrap } from "hooks/useQuery";

export type MakespanOptions = {
  instance?: string;
  solutionPath?: string;
};

const mutex = new Mutex();

export const useMakespanData = ({
  instance,
  solutionPath,
}: MakespanOptions = {}) => {
  const key = ["instance-makespan", instance, solutionPath];
  return useQuery({
    queryKey: key,
    staleTime: Infinity,
    queryFn: async ({ signal }) => {
      return await mutex.runExclusive(async () => {
        if (signal.aborted) {
          await queryClient.cancelQueries({ queryKey: key });
          return null;
        }
        return await unwrap(
          api.api.map.makespan.post({ instance, solutionPath })
        );
      });
    },
    enabled: !!(instance || solutionPath),
  });
};

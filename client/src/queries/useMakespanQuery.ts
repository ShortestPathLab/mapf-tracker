import { useQuery } from "@tanstack/react-query";
import { APIConfig } from "core/config";
import { Mutex } from "async-mutex";
import { queryClient } from "App";
import { post } from "./mutation";

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
        const response = await post(`${APIConfig.apiUrl}/map/makespan`, {
          instance,
          solutionPath,
        });
        return JSON.parse(await response.text()) as number | null;
      });
    },
    enabled: !!(instance || solutionPath),
  });
};

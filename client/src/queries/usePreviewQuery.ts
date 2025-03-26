import { useQuery } from "@tanstack/react-query";
import { APIConfig } from "core/config";
import { post } from "./mutation";
import { Mutex } from "async-mutex";
import { queryClient } from "App";

export type PreviewOptions = {
  map?: string;
  instance?: string;
  scenario?: string;
};

const mutex = new Mutex();

export const usePreviewData = ({
  map,
  instance,
  scenario,
}: PreviewOptions = {}) => {
  const key = ["visualisation-preview", map, instance, scenario];
  return useQuery({
    queryKey: key,
    queryFn: async ({ signal }) => {
      return await mutex.runExclusive(async () => {
        if (signal.aborted) return queryClient.cancelQueries({ queryKey: key });
        const response = await post(`${APIConfig.apiUrl}/map/preview`, {
          map,
          instance,
          scenario,
        });
        return JSON.parse(await response.text()) as string;
      });
    },
    enabled: !(!map && !instance && !scenario),
  });
};

import { useQuery } from "@tanstack/react-query";
import api, { unwrap } from "hooks/useQuery";
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
    staleTime: Infinity,
    queryFn: async ({ signal }) => {
      return await mutex.runExclusive(async () => {
        if (signal.aborted) return queryClient.cancelQueries({ queryKey: key });
        return await unwrap(
          api.api.map.preview.post({ map, instance, scenario })
        );
      });
    },
    enabled: !(!map && !instance && !scenario),
  });
};

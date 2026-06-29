import { useQuery } from "@tanstack/react-query";
import { Mutex } from "async-mutex";
import api, { unwrap } from "hooks/useQuery";

export type PreviewOptions = {
  map?: string;
  instance?: string;
  scenario?: string;
};

const mutex = new Mutex();

export const usePreviewData = ({ map, instance, scenario }: PreviewOptions = {}) => {
  const key = ["visualisation-preview", map, instance, scenario];
  return useQuery({
    queryKey: key,
    staleTime: Infinity,
    queryFn: ({ signal }) =>
      mutex.runExclusive(() =>
        unwrap(api.api.map.preview.post({ map, instance, scenario, $fetch: { signal } })),
      ),
    enabled: !(!map && !instance && !scenario),
  });
};

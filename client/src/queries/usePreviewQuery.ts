import { useQuery } from "@tanstack/react-query";
import { APIConfig } from "core/config";
import { post } from "./mutation";

export type PreviewOptions = {
  map?: string;
  instance?: string;
  scenario?: string;
};

export const usePreviewData = ({
  map,
  instance,
  scenario,
}: PreviewOptions = {}) => {
  return useQuery({
    queryKey: ["visualisation-preview", map, instance, scenario],
    queryFn: async () => {
      const response = await post(`${APIConfig.apiUrl}/map/preview`, {
        map,
        instance,
        scenario,
      });
      return JSON.parse(await response.text()) as string;
    },
    enabled: !(!map && !instance && !scenario),
  });
};

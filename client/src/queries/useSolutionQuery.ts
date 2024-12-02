import { useQuery } from "@tanstack/react-query";
import { APIConfig } from "core/config";
import { json } from "./query";

export const useSolutionData = (
  id?: number | string,
  source: "ongoing" | "submitted" = "submitted"
) =>
  useQuery({
    queryKey: ["solutionPath", id],
    queryFn: () =>
      json<string[]>(`${APIConfig.apiUrl}/solution_path/${source}/${id}`),
    enabled: !!id,
  });

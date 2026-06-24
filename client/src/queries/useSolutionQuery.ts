import { useQuery } from "@tanstack/react-query";
import api, { untyped } from "hooks/useQuery";

export const useSolutionData = (
  id?: number | string,
  source: "ongoing" | "submitted" = "submitted"
) =>
  useQuery({
    queryKey: ["solutionPath", id],
    queryFn: () =>
      untyped<string[]>(
        api.api.solution_path({ source })({ id: `${id}` }).get()
      ),
    enabled: !!id,
  });

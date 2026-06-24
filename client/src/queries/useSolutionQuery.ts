import api, { useQuery } from "hooks/useQuery";

export const useSolutionData = (
  id?: number | string,
  source: "ongoing" | "submitted" = "submitted"
) =>
  useQuery(
    ["solutionPath", id],
    () => api.api.solution_path({ source })({ id: `${id}` }).get(),
    { enabled: !!id }
  );

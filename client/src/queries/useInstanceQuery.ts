import { APIConfig } from "core/config";
import { Instance } from "core/types";
import { json } from "./query";
import { useQuery } from "@tanstack/react-query";

export const useInstanceData = (id: number | string) =>
  useQuery({
    queryKey: ["instance", id],
    queryFn: () => json<Instance>(`${APIConfig.apiUrl}/instance/id/${id}`),
    enabled: !!id,
  });

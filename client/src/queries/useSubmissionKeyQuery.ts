import { useQuery } from "@tanstack/react-query";
import { APIConfig } from "core/config";
import { json } from "./query";

export function useSubmissionKeyQuery(key: string | number) {
  return useQuery({
    refetchInterval: 1000,
    enabled: !!key,
    queryKey: ["submissionKey", key],
    queryFn: () =>
      json<{
        request_id: string;
        api_key: string;
        status?: { type?: "submitted" | "default" };
        creationDate: string;
        expirationDate: string;
      }>(`${APIConfig.apiUrl}/submission_key/${key}`),
  });
}

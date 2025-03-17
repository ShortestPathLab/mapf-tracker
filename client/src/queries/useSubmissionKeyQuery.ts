import { useMutation, useQuery } from "@tanstack/react-query";
import { APIConfig } from "core/config";
import { json, toJson, useBasic } from "./query";
import { request } from "./mutation";

export type ApiKey = {
  id: string;
  request_id: string;
  api_key: string;
  status?: {
    type?: "submitted" | "default";
  };
  creationDate: string;
  expirationDate: string;
};

export type User = {
  id: string;
  username: string;
  hash?: string;
  createdAt?: string;
  updatedAt?: string;
};

export const userBasic = useBasic<User>(`${APIConfig.apiUrl}/user/basic`);
export const submissionKeyBasic = useBasic<ApiKey>(
  `${APIConfig.apiUrl}/submission_key/basic`
);

export function useCreateSubmissionKey() {
  return useMutation({
    mutationKey: ["createSubmissionKey"],
    mutationFn: (requestId: string) =>
      request(`${APIConfig.apiUrl}/submission_key/create/${requestId}`).then(
        toJson
      ) as Promise<{ key: string }>,
  });
}

export function useSubmissionKeyQuery(key: string | number) {
  return useQuery({
    refetchInterval: 1000,
    enabled: !!key,
    queryKey: ["submissionKey", key],
    queryFn: () => json<ApiKey>(`${APIConfig.apiUrl}/submission_key/${key}`),
  });
}

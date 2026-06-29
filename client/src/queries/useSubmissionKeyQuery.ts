import { queryClient } from "App";
import api, { DataOf, useMutation, useQuery } from "hooks/useQuery";

export type ApiKey = DataOf<typeof api.api.submissionKey.basic.get>[number];

export const userBasic = {
  useAll: () => useQuery(["user", "all"], api.api.user.basic.get),
  useDelete: () =>
    useMutation((id: string) => api.api.user.basic({ id }).delete(), {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ["user"] }),
    }),
  useWrite: () =>
    useMutation(
      (item: { username: string; password: string; id?: string }) => api.api.user.basic.put(item),
      { onSuccess: () => queryClient.invalidateQueries({ queryKey: ["user"] }) },
    ),
};

export const submissionKeyBasic = {
  useAll: () => useQuery(["submissionKey", "all"], api.api.submissionKey.basic.get),
  useDelete: () =>
    useMutation((id: string) => api.api.submissionKey.basic({ id }).delete(), {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ["submissionKey"] }),
    }),
};

export function useCreateSubmissionKey() {
  return useMutation(
    (requestId: string) => api.api.submissionKey.request({ request: requestId }).post(),
    { mutationKey: ["createSubmissionKey"] },
  );
}

export function useSubmissionKeyQuery(key: string | number) {
  return useQuery(["submissionKey", key], () => api.api.submissionKey({ apiKey: `${key}` }).get(), {
    refetchInterval: 1000,
    enabled: !!key,
  });
}

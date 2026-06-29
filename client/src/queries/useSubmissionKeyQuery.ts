import { queryClient } from "App";
import api, { DataOf, useMutation, useQuery } from "hooks/useQuery";

export type ApiKey = DataOf<typeof api.api.submission_key.basic.get>[number];

export const userBasic = {
  useAll: () => useQuery(["user", "all"], api.api.user.basic.get),
  useDelete: () =>
    useMutation((id: string) => api.api.user.basic.delete.post({ id }), {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ["user"] }),
    }),
  useWrite: () =>
    useMutation(
      (item: { username: string; password: string; id?: string }) =>
        api.api.user.basic.write.post(item),
      { onSuccess: () => queryClient.invalidateQueries({ queryKey: ["user"] }) },
    ),
};

export const submissionKeyBasic = {
  useAll: () => useQuery(["submission_key", "all"], api.api.submission_key.basic.get),
  useDelete: () =>
    useMutation((id: string) => api.api.submission_key.basic.delete.post({ id }), {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ["submission_key"] }),
    }),
};

export function useCreateSubmissionKey() {
  return useMutation(
    (requestId: string) => api.api.submission_key.create({ request: requestId }).post(),
    { mutationKey: ["createSubmissionKey"] },
  );
}

export function useSubmissionKeyQuery(key: string | number) {
  return useQuery(
    ["submissionKey", key],
    () => api.api.submission_key({ apiKey: `${key}` }).get(),
    { refetchInterval: 1000, enabled: !!key },
  );
}

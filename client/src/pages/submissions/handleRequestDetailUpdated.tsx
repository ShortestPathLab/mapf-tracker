import { queryClient } from "App";
import api from "hooks/useQuery";
import { Request } from "queries/useRequestQuery";

export const handleRequestDetailUpdated = async ({
  key,
  ...values
}: Partial<Request> & {
  id: string | number;
  key?: string | number;
}) => {
  try {
    const { error } = await api.api.request
      .update({ id: `${values?.id}` })
      .post(values);
    queryClient.invalidateQueries({
      queryKey: ["submissionRequestDetails", key],
    });
    if (error) {
      console.error("Error updating request:", error);
    }
  } catch (error) {
    console.error("Error:", error);
  }
};

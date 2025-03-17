import { queryClient } from "App";
import { APIConfig } from "core/config";
import { request } from "queries/mutation";
import { Request } from "queries/useRequestQuery";

export const handleRequestDetailUpdated = async ({
  key,
  ...values
}: Request & { id: string | number; key: string | number }) => {
  try {
    const response = await request(
      `${APIConfig.apiUrl}/request/update/${values?.id}`,
      values
    );

    const data = await response.json();
    queryClient.invalidateQueries({
      queryKey: ["submissionRequestDetails", key],
    });
    if (!response.ok) {
      console.error("Error updating request:", data);
    }
  } catch (error) {
    console.error("Error:", error);
  }
};

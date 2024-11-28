import { queryClient } from "App";
import { APIConfig } from "core/config";
import { Request } from "queries/useRequestQuery";

export const handleRequestDetailUpdated = async ({
  key,
  id,
  ...values
}: Request & { id: string | number; key: string | number }) => {
  try {
    const response = await fetch(`${APIConfig.apiUrl}/request/update/${id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    });

    const data = await response.json();
    if (response.ok) {
      queryClient.invalidateQueries({
        queryKey: ["submissionRequestDetails", key],
      });
    } else {
      console.error("Error updating request:", data);
    }
  } catch (error) {
    console.error("Error:", error);
  }
};

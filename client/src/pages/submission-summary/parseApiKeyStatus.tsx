import { isBefore, parseISO } from "date-fns";
import { now } from "lodash";
import { ApiKey } from "queries/useSubmissionKeyQuery";

export function parseApiKeyStatus(apiKeyData?: ApiKey) {
  return apiKeyData
    ? apiKeyData?.status?.type === "submitted"
      ? "submitted"
      : apiKeyData?.expirationDate &&
        isBefore(now(), parseISO(apiKeyData.expirationDate))
      ? "in-progress"
      : "expired"
    : "unknown";
}

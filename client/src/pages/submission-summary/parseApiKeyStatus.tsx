import { isBefore, parseISO } from "date-fns";
import { now } from "lodash";
import { ApiKey } from "queries/useSubmissionKeyQuery";
import { tryChain } from "utils/tryChain";

export function parseApiKeyStatus(apiKeyData?: ApiKey) {
  return apiKeyData
    ? apiKeyData?.status?.type === "submitted"
      ? "submitted"
      : tryChain(
            () => apiKeyData.expirationDate && isBefore(now(), apiKeyData.expirationDate),
            () => false,
          )
        ? "in-progress"
        : "expired"
    : "unknown";
}

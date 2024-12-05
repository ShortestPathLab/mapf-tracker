import { Box } from "@mui/material";
import { Counter } from "components/Counter";
import { filter, minBy, now, sumBy } from "lodash";
import {
  useOngoingSubmissionSummaryQuery,
  useOngoingSubmissionTicketQuery,
} from "queries/useOngoingSubmissionQuery";
import { useSubmissionKeyQuery } from "queries/useSubmissionKeyQuery";
import { parseApiKeyStatus } from "./parseApiKeyStatus";

export function Status({ apiKey }: { apiKey?: string | number }) {
  const { data: apiKeyData } = useSubmissionKeyQuery(apiKey);
  const { data: isPending } = useOngoingSubmissionTicketQuery(apiKey);
  const someIsPending = filter(isPending, (p) => p.status === "pending");
  const { data: s } = useOngoingSubmissionSummaryQuery(apiKey);

  const total = (path: string) => sumBy(s?.maps, path);

  const keyStatus = someIsPending.length
    ? "receiving"
    : total("count.queued")
    ? "validating"
    : parseApiKeyStatus(apiKeyData);

  return (
    <>
      <Box
        sx={{
          display: "inline-block",
          width: 6,
          height: 6,
          borderRadius: 1,
          mr: 1,
          verticalAlign: "middle",
          mb: 0.25,
          bgcolor:
            {
              submitted: "text.secondary",
              "in-progress": "success.main",
              expired: "error.main",
              receiving: "warning.main",
              validating: "warning.main",
            }[keyStatus] ?? "text.secondary",
        }}
      />
      {{
        submitted: "Submitted",
        "in-progress": "Open",
        expired: "Expired",
        validating: `Running validation: ${
          total("count.total") -
          total("count.valid") -
          total("count.invalid") -
          total("count.outdated")
        } remaining`,
        receiving: (
          <>
            {"Processing: "}
            <Counter
              start={
                minBy(someIsPending, "dateReceived")?.dateReceived ?? now()
              }
            />
          </>
        ),
      }[keyStatus] ?? "Unknown"}
    </>
  );
}

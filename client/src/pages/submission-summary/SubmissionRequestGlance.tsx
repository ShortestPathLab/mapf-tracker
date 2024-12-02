import { EditOutlined } from "@mui/icons-material";
import { Box, Button, Chip, Stack } from "@mui/material";
import { Counter } from "components/Counter";
import { DetailsList } from "components/DetailsList";
import { useSnackbar } from "components/Snackbar";
import { format, isBefore, parseISO } from "date-fns";
import { useDialog } from "hooks/useDialog";
import { filter, minBy, now, some, startCase } from "lodash";
import { SubmissionKeyRequestFormDialog } from "pages/submissions/SubmissionKeyRequestFormDialog";
import { handleRequestDetailUpdated } from "pages/submissions/handleRequestDetailUpdated";
import { useOngoingSubmissionTicketQuery } from "queries/useOngoingSubmissionQuery";
import { useRequestData } from "queries/useRequestQuery";
import { useSubmissionKeyQuery } from "queries/useSubmissionKeyQuery";

export const SubmissionRequestGlance = ({
  apiKey,
}: {
  apiKey?: string | number;
}) => {
  const notify = useSnackbar();
  const { open: showRequestDetails, dialog: requestDetails } = useDialog(
    SubmissionKeyRequestFormDialog,
    {
      slotProps: { modal: { width: 640, variant: "default" } },
      padded: true,
      title: "Edit request details",
    }
  );
  const { data: request } = useRequestData(apiKey);
  const { data: apiKeyData } = useSubmissionKeyQuery(apiKey);
  const { data: isPending } = useOngoingSubmissionTicketQuery(apiKey);
  const someIsPending = filter(isPending, (p) => p.status === "pending");

  const keyStatus = someIsPending.length
    ? "receiving"
    : apiKeyData
    ? apiKeyData?.status?.type === "submitted"
      ? "submitted"
      : apiKeyData?.expirationDate &&
        isBefore(now(), parseISO(apiKeyData.expirationDate))
      ? "in-progress"
      : "expired"
    : "unknown";

  return (
    <>
      <Stack direction="row" sx={{ gap: 2, justifyContent: "space-between" }}>
        <DetailsList
          sx={{ m: -2 }}
          items={[
            { label: "Algorithm", value: request?.algorithmName },
            { label: "API key", value: `${apiKey}` },
            {
              label: "Expiry",
              value:
                apiKeyData?.expirationDate &&
                format(
                  parseISO(apiKeyData?.expirationDate),
                  "yyyy MMM dd hh:mm aaa"
                ),
            },
            {
              label: "Status",
              value: (
                <Stack direction="row" sx={{ alignItems: "center", gap: 1 }}>
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: 1,
                      bgcolor:
                        {
                          submitted: "text.secondary",
                          "in-progress": "success.main",
                          expired: "error.main",
                          receiving: "warning.main",
                        }[keyStatus] ?? "default",
                    }}
                  />
                  {{
                    submitted: "Submitted",
                    "in-progress": "Open",
                    expired: "Expired",
                    receiving: (
                      <>
                        {"Processing: "}
                        <Counter
                          start={
                            minBy(someIsPending, "dateReceived")
                              ?.dateReceived ?? now()
                          }
                        />
                      </>
                    ),
                  }[keyStatus] ?? "Unknown"}
                </Stack>
              ),
            },
          ]}
        />
        <Button
          color="inherit"
          startIcon={<EditOutlined />}
          sx={{ alignSelf: "flex-start", minWidth: "max-content" }}
          onClick={() =>
            showRequestDetails({
              initialValues: request,
              onSubmit: (values) => {
                handleRequestDetailUpdated({
                  id: "",
                  ...request,
                  ...values,
                });
                notify("Saved successfully");
              },
            })
          }
        >
          Edit details
        </Button>
      </Stack>
      {requestDetails}
    </>
  );
};

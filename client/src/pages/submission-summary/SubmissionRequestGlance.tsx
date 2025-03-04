import { EditRounded } from "@mui-symbols-material/w400";
import { Button, Stack } from "@mui/material";
import { DetailsList } from "components/DetailsList";
import { useSnackbar } from "components/Snackbar";
import { format, parseISO } from "date-fns";
import { useDialog } from "hooks/useDialog";
import { SubmissionKeyRequestFormDialog } from "pages/submissions/SubmissionKeyRequestFormDialog";
import { handleRequestDetailUpdated } from "pages/submissions/handleRequestDetailUpdated";
import { useRequestData } from "queries/useRequestQuery";
import { useSubmissionKeyQuery } from "queries/useSubmissionKeyQuery";
import { DATE_TIME_FORMAT } from "utils/format";
import { Status } from "./Status";

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

  return (
    <>
      <Stack direction="row" sx={{ gap: 2, justifyContent: "space-between" }}>
        <DetailsList
          sx={{ m: -2, overflow: "hidden", lineBreak: "anywhere" }}
          items={[
            { label: "Algorithm", value: request?.algorithmName ?? "-" },
            { label: "API key", value: `${apiKey ?? "-"}` },
            {
              label: "Expiry",
              value:
                (apiKeyData?.expirationDate &&
                  format(
                    parseISO(apiKeyData?.expirationDate),
                    DATE_TIME_FORMAT
                  )) ??
                "-",
            },
            {
              label: "Status",
              value: <Status apiKey={apiKey} />,
            },
          ]}
        />
        <Button
          color="inherit"
          startIcon={<EditRounded />}
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

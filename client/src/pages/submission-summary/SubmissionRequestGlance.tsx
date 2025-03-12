import { EditRounded } from "@mui-symbols-material/w400";
import { Button, Stack } from "@mui/material";
import { DetailsList } from "components/DetailsList";
import { useSnackbar } from "components/Snackbar";
import { format, parseISO } from "date-fns";
import { useSurface } from "components/surface/useSurface";
import { SubmissionKeyRequestFormDialog } from "pages/submissions/SubmissionKeyRequestFormDialog";
import { handleRequestDetailUpdated } from "pages/submissions/handleRequestDetailUpdated";
import { useRequestData } from "queries/useRequestQuery";
import { useSubmissionKeyQuery } from "queries/useSubmissionKeyQuery";
import { DATE_FORMAT } from "utils/format";
import { Status } from "./Status";

export const SubmissionRequestGlance = ({
  apiKey,
}: {
  apiKey?: string | number;
}) => {
  const notify = useSnackbar();
  const { open: showRequestDetails, dialog: requestDetails } = useSurface(
    SubmissionKeyRequestFormDialog,
    {
      title: "Edit request details",
    }
  );
  const { data: request } = useRequestData(apiKey);
  const { data: apiKeyData } = useSubmissionKeyQuery(apiKey);

  return (
    <>
      <Stack direction="row" sx={{ gap: 2, justifyContent: "space-between" }}>
        <DetailsList
          sx={{ m: -2, overflow: "hidden" }}
          items={[
            { label: "Algorithm", value: request?.algorithmName ?? "-" },
            { label: "API key", value: `${apiKey ?? "-"}` },
            {
              label: "Expiry",
              value:
                (apiKeyData?.expirationDate &&
                  format(parseISO(apiKeyData?.expirationDate), DATE_FORMAT)) ??
                "-",
            },
            {
              label: "Status",
              value: <Status apiKey={apiKey} />,
            },
            {
              label: "Comments",
              value: request?.comments ? request.comments : "(None)",
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
              onSubmit: async (values) => {
                await handleRequestDetailUpdated({
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

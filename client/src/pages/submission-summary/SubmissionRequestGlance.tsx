import { EditOutlined } from "@mui/icons-material";
import { Button, Stack } from "@mui/material";
import { DetailsList } from "components/DetailsList";
import { useSnackbar } from "components/Snackbar";
import { useDialog } from "hooks/useDialog";
import { SubmissionKeyRequestFormDialog } from "pages/submissions/SubmissionKeyRequestFormDialog";
import { handleRequestDetailUpdated } from "pages/submissions/handleRequestDetailUpdated";
import { useRequestData } from "queries/useRequestQuery";

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
  return (
    <>
      <Stack direction="row" sx={{ gap: 2, justifyContent: "space-between" }}>
        <DetailsList
          sx={{ m: -2 }}
          items={[
            { label: "Algorithm", value: request?.algorithmName },
            { label: "API key", value: `${apiKey}` },
          ]}
        />
        <Button
          color="inherit"
          startIcon={<EditOutlined />}
          sx={{ alignSelf: "flex-start" }}
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
          Edit request details
        </Button>
      </Stack>
      {requestDetails}
    </>
  );
};

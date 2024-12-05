import { CheckOutlined } from "@mui/icons-material";
import { Button, Stack, Typography } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { useSnackbar } from "components/Snackbar";
import { APIConfig } from "core/config";
import { SubmissionKeyRequestForm } from "forms/SubmissionKeyRequestForm";
import { post } from "queries/mutation";
import { Request } from "queries/useRequestQuery";

export function SubmitRequestForm() {
  const notify = useSnackbar();

  const { mutateAsync: submit } = useMutation({
    mutationFn: async (request: Request) =>
      post(`${APIConfig.apiUrl}/request/create`, request),
    mutationKey: ["requestSubmissionKey"],
  });

  return (
    <>
      <Stack gap={2} mb={2}>
        <Typography variant="h4" gutterBottom>
          Request a submission key
        </Typography>
        <Typography variant="body1">
          Ready to submit your algorithm to our tracker? Fill out this form and
          our team will get back to you with your submission key.
        </Typography>
      </Stack>
      <SubmissionKeyRequestForm
        submit={({ isSubmitting }) => (
          <Button
            fullWidth
            sx={{ mt: 4 }}
            type="submit"
            variant="contained"
            size="large"
            disableElevation
            disabled={isSubmitting}
            startIcon={<CheckOutlined />}
          >
            {isSubmitting ? "Submitting request..." : "Submit request"}
          </Button>
        )}
        onSubmit={(values) =>
          submit(values, {
            onSuccess: () => notify("Request submitted"),
            onError: () => notify("Something went wrong"),
          })
        }
      />
    </>
  );
}

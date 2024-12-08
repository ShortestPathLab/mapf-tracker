import { CheckOutlined } from "@mui/icons-material";
import { Box, Button } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { Floating } from "components/Floating";
import { useSnackbar } from "components/Snackbar";
import { ConfirmDialog } from "components/dialog/Modal";
import { APIConfig } from "core/config";
import { SubmissionKeyRequestForm } from "forms/SubmissionKeyRequestForm";
import { useDialog } from "hooks/useDialog";
import { defer } from "lodash";
import { post } from "queries/mutation";
import { Request } from "queries/useRequestQuery";

const hintText = (algorithm: string, email: string) =>
  `Are you sure you want to submit this request for "${algorithm}"? Once submitted, you will not be able to edit it. Make sure all details are entered correctly.\n\nYou will receive a confirmation email in your contact email inbox, ${email}.`;

export function SubmitRequestForm({
  onClose,
  floatingSubmitButton,
}: {
  floatingSubmitButton?: boolean;
  onClose?: () => void;
}) {
  const notify = useSnackbar();

  const { open, close, dialog } = useDialog(ConfirmDialog, {
    title: "Submit request",
    slotProps: { modal: { variant: "default" } },
    padded: true,
  });

  const { mutateAsync: submit } = useMutation({
    mutationFn: async (request: Request) =>
      post(`${APIConfig.apiUrl}/request/create`, request),
    mutationKey: ["requestSubmissionKey"],
  });

  const ButtonPositioning = floatingSubmitButton ? Floating : Box;

  return (
    <>
      <SubmissionKeyRequestForm
        submit={({ isSubmitting, submitForm, values }) => (
          <ButtonPositioning>
            <Button
              fullWidth
              sx={{ mt: 4 }}
              variant="contained"
              onClick={() =>
                open({
                  hintText: hintText(
                    values.algorithmName,
                    values.requesterEmail
                  ),
                  acceptLabel: "Submit request",
                  acceptProps: { color: "primary" },
                  closeLabel: "Cancel",

                  onAccept: async () => {
                    close();
                    submitForm();
                  },
                })
              }
              size="large"
              disableElevation
              disabled={isSubmitting}
              startIcon={<CheckOutlined />}
            >
              {isSubmitting ? "Submitting request..." : "Submit request"}
            </Button>
          </ButtonPositioning>
        )}
        onSubmit={async (values, { resetForm }) => {
          onClose?.();
          await submit(values, {
            onSuccess: () => {
              notify("Request submitted");

              defer(resetForm);
            },
            onError: () => notify("Something went wrong"),
          });
        }}
      />
      {dialog}
    </>
  );
}

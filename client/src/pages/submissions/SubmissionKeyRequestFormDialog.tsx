import { CheckRounded } from "@mui-symbols-material/w400";
import { Stack } from "@mui/material";
import Button from "@mui/material/Button";
import { useSnackbar } from "components/Snackbar";
import {
  SubmissionKeyRequestForm,
  SubmissionKeyRequestFormProps,
} from "forms/SubmissionKeyRequestForm";
import { DialogContentProps } from "hooks/useDialog";
import { Floating } from "../../components/Floating";

export function SubmissionKeyRequestFormDialog({
  onProps,
  onClose,
  ...props
}: SubmissionKeyRequestFormProps & DialogContentProps) {
  const notify = useSnackbar();
  return (
    <Stack sx={{ mt: -2 }}>
      <SubmissionKeyRequestForm
        disabledValues={{
          requesterEmail: true,
        }}
        onTouched={() => onProps?.({ preventClose: true })}
        submit={({ isSubmitting, submitForm }) => (
          <Floating>
            <Button
              fullWidth
              sx={{ mt: 4, boxShadow: (t) => t.shadows[2] }}
              onClick={async () => {
                notify("Saving changes");
                await submitForm();
                notify("Changed saved");
                onClose?.();
              }}
              variant="contained"
              size="large"
              disabled={isSubmitting}
              startIcon={<CheckRounded />}
            >
              Save changes
            </Button>
          </Floating>
        )}
        {...props}
      />
    </Stack>
  );
}

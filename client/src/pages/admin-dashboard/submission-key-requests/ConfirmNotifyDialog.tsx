import {
  Button,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import { useSnackbar } from "components/Snackbar";
import { DialogContentProps } from "hooks/useDialog";
import { SetReviewOutcomeForm } from "./SetReviewOutcomeForm";
import {
  RequestWithReviewOutcome,
  useRequestsUpdateMutation,
  useSendOutcomeMutation,
} from "../../../queries/useRequestsQuery";

const hintText = (data: RequestWithReviewOutcome) =>
  `A new submission (API) key will be generated and sent to ${data.requesterEmail} along with the review outcome and comments`;

export function ConfirmNotifyDialog({
  data,
  onClose,
  onConfirm,
}: {
  data?: RequestWithReviewOutcome;
  onConfirm?: () => void;
} & DialogContentProps) {
  const notify = useSnackbar();
  const { mutateAsync: updateRequest } = useRequestsUpdateMutation();
  const { mutateAsync: sendOutcome } = useSendOutcomeMutation();
  return (
    <Stack sx={{ gap: 2 }}>
      <List sx={{ mx: -2, mt: -2 }}>
        <ListItem>
          <ListItemText primary={data.requesterName} secondary="Recipient" />
        </ListItem>
        <ListItem>
          <ListItemText primary={data.requesterEmail} secondary="Address" />
        </ListItem>
      </List>
      <SetReviewOutcomeForm
        onSubmit={(values) =>
          updateRequest({
            id: data?.id,
            value: {
              ...data,
              reviewStatus: values,
            },
          })
        }
        initialValues={data?.reviewStatus}
        submit={({ submitForm }) => (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
              {hintText(data)}
            </Typography>
            <Button
              variant="contained"
              onClick={async () => {
                onConfirm?.();
                notify("Saving outcome");
                await submitForm();
                notify("Requesting for an API key to be sent");
                await sendOutcome(data?.id);
                notify("Successfully requested for an API key to be sent");
                onClose?.();
              }}
            >
              Generate and send API key
            </Button>
          </>
        )}
      />
    </Stack>
  );
}

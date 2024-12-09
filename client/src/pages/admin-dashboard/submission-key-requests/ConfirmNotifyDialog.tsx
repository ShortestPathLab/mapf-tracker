import { Button, List, ListItem, Stack, Typography } from "@mui/material";
import { Item } from "components/Item";
import { useSnackbar } from "components/Snackbar";
import { DialogContentProps } from "hooks/useDialog";
import {
  RequestWithReviewOutcome,
  useRequestsUpdateMutation,
  useSendOutcomeMutation,
} from "queries/useRequestsQuery";
import { SetReviewOutcomeForm } from "./SetReviewOutcomeForm";

const hintText = (data?: RequestWithReviewOutcome) =>
  `A response email will sent to ${data?.requesterEmail} along with the review outcome and comments. If the request was approved, a new submission (API) key will be included.`;

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
          <Item invert primary={data?.requesterName} secondary="Recipient" />
        </ListItem>
        <ListItem>
          <Item invert primary={data?.requesterEmail} secondary="Address" />
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
                notify("Queueing a response to be sent");
                await sendOutcome(data?.id);
                notify("Successfully queued a response to be sent");
                onClose?.();
              }}
            >
              Send response
            </Button>
          </>
        )}
      />
    </Stack>
  );
}

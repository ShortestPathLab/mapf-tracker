import {
  KeyboardArrowDownRounded,
  SendRounded,
} from "@mui-symbols-material/w400";
import {
  Button,
  ButtonGroup,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import Accordion from "components/Accordion";
import { useSnackbar } from "components/Snackbar";
import { useSm } from "components/dialog/useSmallDisplay";
import { Surface, useSurface } from "components/surface";
import { SubmissionKeyRequestForm } from "forms/SubmissionKeyRequestForm";
import { DialogContentProps } from "hooks/useDialog";
import { delay } from "lodash";
import { bindTrigger } from "material-ui-popup-state";
import {
  RequestWithReviewOutcome,
  useRequestsUpdateElevatedMutation,
} from "queries/useRequestsQuery";
import { paper } from "theme";
import { ConfirmNotifyDialog } from "./ConfirmNotifyDialog";
import { SetReviewOutcomeForm } from "./SetReviewOutcomeForm";

export function ReviewRequestDialog({
  data,
  onClose,
  onProps,
}: { data?: RequestWithReviewOutcome } & DialogContentProps) {
  const { transitions } = useTheme();
  const sm = useSm();
  const notify = useSnackbar();
  const { open: showConfirmation, dialog: confirmationDialog } = useSurface(
    ConfirmNotifyDialog,
    {
      title: "Respond to request",
    }
  );
  const { mutateAsync: updateRequest } = useRequestsUpdateElevatedMutation();
  return (
    <Stack
      direction={sm ? "column" : "row"}
      sx={{ gap: sm ? 4 : 3, "> *": { flex: 1 } }}
    >
      <Stack>
        <Accordion
          sx={{ p: sm ? 2 : 3, ...paper(0) }}
          slotProps={{
            label: { variant: "h5" },
            summary: { sx: { py: 0, my: -2 } },
          }}
          label="Request details"
          defaultExpanded={!sm}
        >
          <SubmissionKeyRequestForm initialValues={data} disabled />
        </Accordion>
      </Stack>
      <Stack sx={{ gap: 4 }}>
        <Typography variant="h5">Request outcome</Typography>
        <SetReviewOutcomeForm
          onTouched={() => onProps?.({ preventClose: true })}
          onSubmit={async (values) => {
            notify("Saving changes");
            await updateRequest({
              id: data?.id,
              value: {
                ...data,
                reviewStatus: values,
              },
            });
            notify("Changes saved");
          }}
          initialValues={data?.reviewStatus}
          submit={({ submitForm, values }) => (
            <ButtonGroup>
              <Button
                sx={{ flex: 1 }}
                variant="contained"
                onClick={async () => {
                  await submitForm();
                  onClose?.();
                }}
              >
                Save changes
              </Button>
              <Surface
                variant="sheet"
                title="More save options"
                trigger={(state) => (
                  <Button
                    {...bindTrigger(state)}
                    variant="contained"
                    sx={{ px: 1 }}
                  >
                    <KeyboardArrowDownRounded />
                  </Button>
                )}
              >
                <List disablePadding>
                  <ListItemButton
                    disableGutters
                    onClick={async () => {
                      await submitForm();
                      showConfirmation({
                        data: { ...data, reviewStatus: values },
                        onClose: () =>
                          delay(
                            () => onClose?.(),
                            transitions.duration.shortest
                          ),
                      });
                    }}
                  >
                    <ListItemIcon sx={{ color: "primary.main" }}>
                      <SendRounded />
                    </ListItemIcon>
                    <ListItemText
                      primary={`Save and send a response to ${data?.requesterEmail}`}
                    />
                  </ListItemButton>
                </List>
              </Surface>
            </ButtonGroup>
          )}
        />
      </Stack>
      {confirmationDialog}
    </Stack>
  );
}

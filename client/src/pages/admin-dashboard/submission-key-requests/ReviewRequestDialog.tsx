import { ExpandMoreOutlined, SendOutlined } from "@mui/icons-material";
import {
  Button,
  ButtonGroup,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { useSm } from "components/dialog/useSmallDisplay";
import { SubmissionKeyRequestForm } from "forms/SubmissionKeyRequestForm";
import { DialogContentProps, useDialog } from "hooks/useDialog";
import { Grid } from "layout";
import PopupState, { bindMenu, bindTrigger } from "material-ui-popup-state";
import { paper } from "theme";
import { ConfirmNotifyDialog } from "./ConfirmNotifyDialog";
import { SetReviewOutcomeForm } from "./SetReviewOutcomeForm";
import {
  RequestWithReviewOutcome,
  useRequestsUpdateMutation,
} from "../../../queries/useRequestsQuery";
import { useSnackbar } from "components/Snackbar";
import Accordion from "components/Accordion";
import { delay } from "lodash";
import { Dialog } from "components/dialog";

export function ReviewRequestDialog({
  data,
  onClose,
  onProps,
}: { data?: RequestWithReviewOutcome } & DialogContentProps) {
  const { transitions } = useTheme();
  const sm = useSm();
  const notify = useSnackbar();
  const { open: showConfirmation, dialog: confirmationDialog } = useDialog(
    ConfirmNotifyDialog,
    { padded: true, title: "Generate and send API key" }
  );
  const { mutateAsync: updateRequest } = useRequestsUpdateMutation();
  return (
    <Grid sx={{ gap: sm ? 4 : 3 }} width={420}>
      <Stack>
        <Accordion
          sx={{ p: sm ? 2 : 3, ...paper() }}
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
              <Dialog
                popover
                title="More save options"
                trigger={(onClick) => (
                  <Button {...{ onClick }} variant="contained" sx={{ px: 1 }}>
                    <ExpandMoreOutlined />
                  </Button>
                )}
                slotProps={{
                  paper: {
                    sx: { width: "max-content" },
                  },
                  popover: {
                    anchorOrigin: { horizontal: "right", vertical: "bottom" },
                    transformOrigin: { horizontal: "right", vertical: "top" },
                  },
                }}
              >
                <List>
                  <ListItemButton
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
                    <ListItemIcon>
                      <SendOutlined />
                    </ListItemIcon>
                    <ListItemText
                      primary={`Save and send an API key to ${data?.requesterEmail}`}
                    />
                  </ListItemButton>
                </List>
              </Dialog>
            </ButtonGroup>
          )}
        />
      </Stack>
      {confirmationDialog}
    </Grid>
  );
}

import {
  EditOutlined,
  ExpandMoreOutlined,
  FeedOutlined,
  SendOutlined,
} from "@mui/icons-material";
import {
  Button,
  ButtonGroup,
  Card,
  Divider,
  ListItemIcon,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from "@mui/material";
import { IconCard } from "components/IconCard";
import { useSnackbar } from "components/Snackbar";
import { makeDataGridActions } from "components/data-grid";
import DataGrid, { GridColDef } from "components/data-grid/DataGrid";
import { Dialog } from "components/dialog";
import { useSm } from "components/dialog/useSmallDisplay";
import { SubmissionKeyRequestForm } from "forms/SubmissionKeyRequestForm";
import { Grid, Layout } from "layout";
import { merge, noop, startCase } from "lodash";
import PopupState, { bindMenu, bindTrigger } from "material-ui-popup-state";
import { cloneElement } from "react";
import { paper } from "theme";
import { StatusChip } from "./StatusChip";
import { SetReviewOutcomeForm, reviewOutcomes } from "./reviewOutcomes";
import {
  RequestWithReviewOutcome,
  useRequestsQuery,
  useRequestsUpdateMutation,
  useSendOutcomeMutation,
} from "./useRequestsQuery";

export default function index() {
  const sm = useSm();
  const notify = useSnackbar();
  const { data: requests } = useRequestsQuery();
  const { mutateAsync: updateRequest } = useRequestsUpdateMutation();
  const { mutateAsync: sendOutcome } = useSendOutcomeMutation();

  const columns: GridColDef<RequestWithReviewOutcome>[] = [
    {
      field: "Icon",
      renderCell: () => <IconCard icon={<FeedOutlined />} />,
      flex: 0,
    },
    {
      field: "algorithmName",
      headerName: "Algorithm",
      sortable: false,
      width: 280,
    },
    {
      field: "requesterName",
      headerName: "Requester",
      sortable: false,
      width: 140,
    },
    {
      field: "requesterEmail",
      headerName: "Email",
      sortable: false,
      width: 220,
    },

    {
      field: "reviewStatus",
      headerName: "Outcome",
      sortable: true,
      width: 180,
      renderCell: ({ row, api }) => (
        <PopupState variant="popover">
          {(s) => (
            <>
              <StatusChip
                {...bindTrigger(s)}
                status={row.reviewStatus.status}
                deleteIcon={
                  <ExpandMoreOutlined sx={{ pointerEvents: "none" }} />
                }
                onDelete={noop}
              />
              <Menu
                {...bindMenu(s)}
                anchorOrigin={{ horizontal: "center", vertical: "bottom" }}
                transformOrigin={{ horizontal: "center", vertical: "top" }}
              >
                {reviewOutcomes.map((r) => (
                  <MenuItem
                    value={r}
                    onClick={async () => {
                      s.close();
                      await updateRequest({
                        id: row.id,
                        value: merge<
                          Partial<RequestWithReviewOutcome>,
                          Partial<RequestWithReviewOutcome>
                        >(row, { reviewStatus: { status: r } }),
                      });
                      notify("Review outcome set");
                    }}
                  >
                    {startCase(r)}
                  </MenuItem>
                ))}
              </Menu>
            </>
          )}
        </PopupState>
      ),
    },
    makeDataGridActions({
      items: [
        {
          name: "Review request",
          icon: <EditOutlined />,
          render: (row, trigger) => (
            <Dialog
              slotProps={{ modal: { width: 1200 } }}
              title="Review request"
              padded
              trigger={(onClick) => cloneElement(trigger, { onClick })}
            >
              <Grid sx={{ gap: sm ? 4 : 3 }} width={420}>
                <Stack sx={{ gap: 2, p: sm ? 2 : 3, ...paper() }}>
                  <Typography variant="h5">Request details</Typography>
                  <SubmissionKeyRequestForm initialValues={row} disabled />
                </Stack>
                <Stack sx={{ gap: 4 }}>
                  <Typography variant="h5">Edit outcome</Typography>
                  <SetReviewOutcomeForm
                    onSubmit={(values) =>
                      updateRequest({
                        id: row.id,
                        value: {
                          ...row,
                          reviewStatus: values,
                        },
                      })
                    }
                    initialValues={row.reviewStatus}
                    submit={({ submitForm }) => (
                      <ButtonGroup>
                        <Button
                          sx={{ flex: 1 }}
                          variant="contained"
                          type="submit"
                        >
                          Save outcome
                        </Button>
                        <PopupState variant="popover">
                          {(s) => (
                            <>
                              <Button
                                {...bindTrigger(s)}
                                variant="contained"
                                sx={{ px: 1 }}
                              >
                                <ExpandMoreOutlined />
                              </Button>
                              <Menu
                                {...bindMenu(s)}
                                anchorOrigin={{
                                  horizontal: "right",
                                  vertical: "bottom",
                                }}
                                transformOrigin={{
                                  horizontal: "right",
                                  vertical: "top",
                                }}
                              >
                                <MenuItem
                                  onClick={async () => {
                                    await submitForm();
                                    await sendOutcome(row.id);
                                  }}
                                >
                                  <ListItemIcon>
                                    <SendOutlined />
                                  </ListItemIcon>
                                  Save and send an API key to{" "}
                                  {row.requesterEmail}
                                </MenuItem>
                              </Menu>
                            </>
                          )}
                        </PopupState>
                      </ButtonGroup>
                    )}
                  />
                </Stack>
              </Grid>
            </Dialog>
          ),
        },
        {
          name: "Send outcome",
          icon: <SendOutlined />,
        },
      ],
    }),
  ];

  return (
    <Layout
      title="Submission key requests"
      path={[
        { name: "MAPF Tracker", url: "/" },
        { name: "Dashboard", url: "/dashboard" },
      ]}
    >
      <Card>
        <DataGrid
          columns={columns}
          rows={requests}
          extras={
            <Stack direction="row" sx={{ gap: 2 }}>
              <Divider orientation="vertical" flexItem />
              <Button sx={{ minWidth: "max-content" }} variant="contained">
                Create request
              </Button>
            </Stack>
          }
        />
      </Card>
    </Layout>
  );
}

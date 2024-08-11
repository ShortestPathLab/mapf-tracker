import {
  EditOutlined,
  ExpandMoreOutlined,
  FeedOutlined,
  SendOutlined,
} from "@mui/icons-material";
import {
  Button,
  Card,
  Chip,
  ChipProps,
  Divider,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from "@mui/material";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "App";
import { makeDataGridActions } from "components/data-grid";
import DataGrid, { GridColDef } from "components/data-grid/DataGrid";
import { Dialog } from "components/dialog";
import { useSm } from "components/dialog/useSmallDisplay";
import { Field, Select } from "components/Field";
import { IconCard } from "components/IconCard";
import { useSnackbar } from "components/Snackbar";
import { APIConfig } from "core/config";
import { Form, Formik } from "formik";
import { SubmissionKeyRequestForm } from "forms/SubmissionKeyRequestForm";
import { Grid, Layout } from "layout";
import { merge, noop, startCase } from "lodash";
import PopupState, { bindMenu, bindTrigger } from "material-ui-popup-state";
import { post } from "queries/mutation";
import { json } from "queries/query";
import { Request } from "queries/useRequestQuery";
import { cloneElement } from "react";
import { paper } from "theme";

type ReviewOutcome = {
  status: "not-reviewed" | "approved" | "rejected";
  comments?: string;
};

type RequestWithReviewOutcome = {
  id: string;
  reviewStatus: ReviewOutcome;
} & Request;

function useRequestsQuery() {
  return useQuery({
    queryKey: ["requests"],
    queryFn: () =>
      json<RequestWithReviewOutcome[]>(`${APIConfig.apiUrl}/request`),
  });
}
function useRequestsUpdateMutation() {
  return useMutation({
    mutationKey: ["requestsUpdate"],
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["requests"] });
    },
    mutationFn: ({
      id: key,
      value: values,
    }: {
      id: string;
      value: Partial<RequestWithReviewOutcome>;
    }) => post(`${APIConfig.apiUrl}/request/update/${key}`, values),
  });
}
function useSendOutcomeMutation() {
  return useMutation({
    mutationKey: ["requestsSendOutcome"],
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["requests"] });
    },
    mutationFn: (id: string) =>
      post(`${APIConfig.apiUrl}/user/notify`, { requestId: id }),
  });
}

const StatusChip = ({
  status,
  ...props
}: { status?: ReviewOutcome["status"] } & ChipProps) => (
  <Chip
    label={startCase(status)}
    color={
      {
        rejected: "error",
        "not-reviewed": "warning",
        approved: "success",
      }[status] as "error" | "warning" | "success"
    }
    {...props}
  />
);

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
                {(
                  [
                    "not-reviewed",
                    "approved",
                    "rejected",
                  ] as ReviewOutcome["status"][]
                ).map((r) => (
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
                  <Typography variant="h5">Set outcome</Typography>
                  <Formik<ReviewOutcome>
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
                  >
                    {({ submitForm }) => (
                      <Form>
                        <Stack gap={2}>
                          <Field<ReviewOutcome, typeof Select>
                            as={Select}
                            name="status"
                            label="Status"
                            required
                            SelectProps={{
                              renderValue: (v: ReviewOutcome["status"]) => (
                                <StatusChip status={v} />
                              ),
                            }}
                          >
                            {(
                              [
                                "not-reviewed",
                                "approved",
                                "rejected",
                              ] as ReviewOutcome["status"][]
                            ).map((r) => (
                              <MenuItem value={r}>{startCase(r)}</MenuItem>
                            ))}
                          </Field>
                          <Field<ReviewOutcome>
                            name="comments"
                            label="Comments"
                            multiline
                            minRows={3}
                          />
                          <Button variant="contained" type="submit">
                            Save outcome
                          </Button>
                          <Button
                            variant="outlined"
                            onClick={async () => {
                              await submitForm();
                              await sendOutcome(row.id);
                            }}
                          >
                            Save and send API key to {row.requesterEmail}
                          </Button>
                        </Stack>
                      </Form>
                    )}
                  </Formik>
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

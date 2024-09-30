import {
  ApiOutlined,
  CodeOutlined,
  ContentPasteOutlined,
  DataObjectOutlined,
  DeleteOutlined,
  InfoOutlined,
  RouteOutlined,
  TableChartOutlined,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardActionArea,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import { DataGrid, useDataGridActions } from "components/data-grid";
import { GridColDef } from "components/data-grid/DataGrid";
import { Dialog } from "components/dialog";
import { ConfirmDialog } from "components/dialog/Modal";
import { FlatCard } from "components/FlatCard";
import { IconCard } from "components/IconCard";
import { format, isBefore, parseISO } from "date-fns";
import { useDialog } from "hooks/useDialog";
import { useLocationState } from "hooks/useNavigation";
import { Grid, Layout } from "layout";
import { capitalize, filter, now, startCase } from "lodash";
import { SubmissionLocationState } from "pages/submissions/SubmissionLocationState";
import {
  OngoingSubmission,
  useDeleteOngoingSubmissionMutation,
  useFinaliseOngoingSubmissionMutation,
  useOngoingSubmissionQuery,
  ValidationOutcome,
} from "queries/useOngoingSubmissionQuery";
import { useSubmissionKeyQuery } from "queries/useSubmissionKeyQuery";
import { cloneElement } from "react";
import GenericDetailsList from "./GenericDetailsList";
import SubmissionSummary from "./SubmissionSummary";
import { useRequestData } from "queries/useRequestQuery";

const hintText =
  "You will not be able to edit this submission after it has been submitted. To make a new submission, you must request a new submission key.";
export default function SubmissionSummaryPage() {
  const { apiKey } = useLocationState<SubmissionLocationState>();
  const { data } = useOngoingSubmissionQuery(apiKey);
  const { data: apiKeyData } = useSubmissionKeyQuery(apiKey);
  const { mutate: deleteEntry } = useDeleteOngoingSubmissionMutation(apiKey);
  const { data: requestData } = useRequestData(apiKey);
  const { mutate: finalise } = useFinaliseOngoingSubmissionMutation(apiKey);
  const { open, close, dialog } = useDialog(ConfirmDialog, {
    title: "Finalise submission",
    padded: true,
  });

  const actions = useDataGridActions<OngoingSubmission>({
    items: [
      {
        name: "Details",
        icon: <InfoOutlined />,
        render: (row, trigger) => (
          <Dialog
            slotProps={{ modal: { width: 720 } }}
            title="Submission details"
            padded
            trigger={(onClick) => cloneElement(trigger, { onClick })}
          >
            <GenericDetailsList data={row} sx={{ m: -2 }} />
          </Dialog>
        ),
      },
    ],
    menuItems: [
      {
        name: "Delete entry",
        icon: <DeleteOutlined />,
        action: (row) => deleteEntry(row.id),
      },
    ],
  });

  const keyStatus = apiKeyData
    ? apiKeyData?.status?.type === "submitted"
      ? "submitted"
      : apiKeyData?.expirationDate &&
        isBefore(now(), parseISO(apiKeyData.expirationDate))
      ? "in-progress"
      : "expired"
    : "unknown";

  const columns: GridColDef<OngoingSubmission>[] = [
    {
      field: "Icon",
      width: 48,
      renderCell: () => <IconCard icon={<RouteOutlined />} />,
      flex: 0,
      fold: true,
    },
    {
      field: "agentCountIntent",
      headerName: "Agent count",
      width: 140,
      sortable: true,
    },
    { field: "index", headerName: "Agent index", width: 140, sortable: true },
    {
      field: "createdAt",
      headerName: "Submitted",
      sortable: true,
      width: 220,
      valueFormatter: (c: string) =>
        format(parseISO(c), "hh:mm aaa, dd MMM yyyy"),
    },
    {
      field: "validation",
      sortable: true,
      headerName: "Status",
      valueGetter: (c: ValidationOutcome) => c.outcome ?? "pending",
      renderCell: ({ value }) => (
        <Chip
          label={capitalize(value)}
          color={
            {
              outdated: "default",
              valid: "success",
              invalid: "error",
            }[value] ?? "warning"
          }
        />
      ),
      width: 120,
    },
    actions,
  ];

  return (
    <Layout
      flat
      title="Submit data"
      path={[
        { name: "Submit", url: "/submit" },
        { name: "Submit an algorithm", url: "/contributes" },
        { name: "Manage submissions", url: "/trackSubmission" },
      ]}
    >
      <List sx={{ my: -2 }}>
        {[
          { primary: requestData?.algorithmName, secondary: "Algorithm" },
          { primary: apiKeyData?.api_key, secondary: "API key" },
        ].map((content) => (
          <ListItem sx={{ mx: -2 }}>
            <ListItemText {...content} />
          </ListItem>
        ))}
      </List>
      <SubmissionActions />
      <Divider />
      <Typography variant="h2">Submission Progress</Typography>
      <SubmissionSummary
        status={
          <>
            <Chip
              color={
                {
                  submitted: "success",
                  "in-progress": "warning",
                  expired: "error",
                }[keyStatus] ?? "default"
              }
              label={startCase(keyStatus)}
            />
            <Typography variant="body2" color="text.secondary">
              Expiry:{" "}
              {apiKeyData?.expirationDate &&
                format(
                  parseISO(apiKeyData?.expirationDate),
                  "hh:mm aaa, dd MMM yyyy"
                )}
            </Typography>
          </>
        }
        summaryStats={[
          { name: "Submitted", count: data?.length },
          {
            name: "Validated",
            count: filter(data, (c) => c.validation?.isValidationRun)?.length,
          },
          {
            name: "Failed",
            count: filter(data, (c) => c.validation?.errors?.length)?.length,
          },
          {
            name: "Placeholder",
            count: -1,
          },
        ]}
        detailStats={[
          {
            name: "Placeholder",
            stats: [
              { name: "Placeholder", count: -1 },
              { name: "Placeholder", count: -1 },
              { name: "Placeholder", count: -1 },
            ],
          },
        ]}
      >
        <FlatCard>
          <DataGrid columns={columns} rows={data} />
        </FlatCard>
      </SubmissionSummary>
      <Button
        disabled={keyStatus === "submitted" || keyStatus === "expired"}
        variant="contained"
        disableElevation
        size="large"
        sx={{ alignSelf: "flex-end", bgcolor: "text.primary" }}
        onClick={() =>
          open({
            hintText,
            acceptLabel: "Submit now",
            acceptProps: { color: "primary" },
            closeLabel: "Cancel",
            onAccept: () => {
              finalise();
              close();
            },
            onClose: close,
          })
        }
      >
        Finish Submission
      </Button>
      {dialog}
    </Layout>
  );
}

export const SubmissionActions = ({}: {}) => {
  return (
    <Grid gap={2}>
      {[
        {
          label: "REST API",
          icon: <DataObjectOutlined />,
          description: "Programmatically submit results via the REST API",
        },
        {
          label: "Spreadsheet",
          icon: <TableChartOutlined />,
          description: "Submit results as one or more CSV files",
        },
        {
          label: "Copy and paste",
          icon: <ContentPasteOutlined />,
          description: "Submit results as JSON from the clipboard",
        },
      ].map((c, i) => (
        <Card key={i}>
          <CardActionArea
            sx={{
              p: 2,
              height: "100%",
              justifyContent: "flex-start",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
            }}
          >
            <Box sx={{ color: "text.secondary", pb: 2 }}>{c.icon}</Box>
            <Typography variant="h6">{c.label}</Typography>
            <Typography variant="body2" color="text.secondary">
              {c.description}
            </Typography>
          </CardActionArea>
        </Card>
      ))}
    </Grid>
  );
};

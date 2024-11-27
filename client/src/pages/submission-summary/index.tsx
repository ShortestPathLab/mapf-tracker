import {
  DeleteOutlined,
  FileDownloadOutlined,
  InfoOutlined,
  RouteOutlined,
} from "@mui/icons-material";
import { Box, Button, Chip, Divider, Stack, Typography } from "@mui/material";
import {
  DataGrid,
  DataGridTitle,
  useDataGridActions,
} from "components/data-grid";
import { GridColDef } from "components/data-grid/DataGrid";
import { Dialog } from "components/dialog";
import { ConfirmDialog } from "components/dialog/Modal";
import { FlatCard } from "components/FlatCard";
import { IconCard } from "components/IconCard";
import { format, isBefore, parseISO } from "date-fns";
import { useDialog } from "hooks/useDialog";
import { useLocationState } from "hooks/useNavigation";
import { Layout } from "layout";
import { capitalize, filter, now, startCase, sumBy } from "lodash";
import { SubmissionLocationState } from "pages/submissions/SubmissionLocationState";
import {
  deleteAll,
  OngoingSubmission,
  useDeleteOngoingSubmissionMutation,
  useFinaliseOngoingSubmissionMutation,
  useOngoingSubmissionQuery,
  useOngoingSubmissionSummaryQuery,
  ValidationOutcome,
} from "queries/useOngoingSubmissionQuery";
import { useRequestData } from "queries/useRequestQuery";
import { useSubmissionKeyQuery } from "queries/useSubmissionKeyQuery";
import { cloneElement } from "react";
import { Actions } from "./Actions";
import GenericDetailsList from "./GenericDetailsList";
import { SubmissionRequestGlance } from "./SubmissionRequestGlance";
import SubmissionSummary from "./SubmissionSummary";
import {
  useBenchmarkData,
  useInstanceCollectionData,
  useScenarioData,
  useMapData,
} from "queries/useBenchmarksQuery";
import { useInstanceData } from "queries/useInstanceQuery";
import pluralize, { plural } from "pluralize";
import SummaryTable from "./SummaryTable";

const hintText =
  "You will not be able to edit this submission after it has been submitted. To make a new submission, you must request a new submission key.";

export default function SubmissionSummaryPage() {
  const { apiKey } = useLocationState<SubmissionLocationState>();
  const { data } = useOngoingSubmissionSummaryQuery(apiKey);
  const { data: apiKeyData } = useSubmissionKeyQuery(apiKey);
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
  });

  const keyStatus = apiKeyData
    ? apiKeyData?.status?.type === "submitted"
      ? "submitted"
      : apiKeyData?.expirationDate &&
        isBefore(now(), parseISO(apiKeyData.expirationDate))
      ? "in-progress"
      : "expired"
    : "unknown";

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
      <SubmissionRequestGlance apiKey={apiKey} />
      <Actions apiKey={apiKey} />
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
          { name: "Submitted", count: sumBy(data?.maps, "count.total") },
          {
            name: "Validation run",
            count:
              sumBy(data?.maps, "count.valid") +
              sumBy(data?.maps, "count.error"),
          },
          {
            name: "Valid",
            count: sumBy(data?.maps, "count.valid"),
          },
          {
            name: "Failed",
            count: sumBy(data?.maps, "count.error"),
          },
        ]}
        detailStats={[]}
      >
        {/* <DataGrid clickable columns={columns} rows={data} /> */}
        <FlatCard>
          <SummaryTable apiKey={apiKey} />
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

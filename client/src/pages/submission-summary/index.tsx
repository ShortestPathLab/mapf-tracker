import { CheckRounded } from "@mui-symbols-material/w400";
import { Box, Button, Stack, Typography } from "@mui/material";
import { ConfirmDialog } from "components/dialog/Modal";
import { useSm } from "components/dialog/useSmallDisplay";
import { useDialog } from "hooks/useDialog";
import { useLocationState, useNavigate } from "hooks/useNavigation";
import { BentoLayout } from "layout/BentoLayout";
import { sumBy } from "lodash";
import { SubmissionLocationState } from "pages/submissions/SubmissionLocationState";
import {
  useFinaliseOngoingSubmissionMutation,
  useOngoingSubmissionSummaryQuery,
} from "queries/useOngoingSubmissionQuery";
import { useRequestData } from "queries/useRequestQuery";
import { useSubmissionKeyQuery } from "queries/useSubmissionKeyQuery";
import { Actions } from "./Actions";
import { SubmissionRequestGlance } from "./SubmissionRequestGlance";
import SubmissionSummary from "./SubmissionSummary";
import { Tickets } from "./Tickets";
import { parseApiKeyStatus } from "./parseApiKeyStatus";
import SummaryTable from "./table/SummaryTable";

const hintText =
  "You will not be able to edit this submission after it has been submitted. To make a new submission, you must request a new submission key. \n\nInvalid or dominated entries will be ignored.";

export default function SubmissionSummaryPage() {
  const { apiKey } = useLocationState<SubmissionLocationState>();
  const { data } = useOngoingSubmissionSummaryQuery(apiKey);
  const { data: apiKeyData } = useSubmissionKeyQuery(apiKey);
  const { data: requestData } = useRequestData(apiKey);
  const { mutate: finalise } = useFinaliseOngoingSubmissionMutation(apiKey);
  const { open, close, dialog } = useDialog(ConfirmDialog, {
    title: "Finish submission",
    slotProps: { modal: { variant: "default" } },
    padded: true,
  });
  const navigate = useNavigate();

  const keyStatus = parseApiKeyStatus(apiKeyData);

  const sm = useSm();

  const contentLeft = [
    <SubmissionRequestGlance key="glance" apiKey={apiKey} />,
    <Actions key="actions" apiKey={apiKey} />,
    <Tickets key="tickets" apiKey={apiKey} />,
    <Box key="gap" sx={{ height: 72 }} />,
  ];

  const contentRight = [
    <SubmissionSummary
      key="summary"
      summaryStats={[
        {
          label: "Progress",
          values: [
            { name: "Received", count: sumBy(data?.maps, "count.total") },
            {
              name: "Running",
              count: sumBy(data?.maps, "count.queued"),
            },
            {
              name: "Run",
              count:
                sumBy(data?.maps, "count.valid") +
                sumBy(data?.maps, "count.invalid") +
                sumBy(data?.maps, "count.outdated"),
            },
          ],
        },
        {
          label: "Validity",
          values: [
            {
              name: "Valid",
              count: sumBy(data?.maps, "count.valid"),
            },
            {
              name: "Invalid",
              count: sumBy(data?.maps, "count.invalid"),
            },
            {
              name: "Duplicate",
              count: sumBy(data?.maps, "count.outdated"),
            },
          ],
        },
        {
          label: "Novelty",
          values: [
            {
              name: "Best",
              count: sumBy(data?.maps, "count.best"),
            },
            {
              name: "Tie",
              count: sumBy(data?.maps, "count.tie"),
            },
            {
              name: "Dominated",
              count: sumBy(data?.maps, "count.dominated"),
            },
          ],
        },
      ]}
      detailStats={[]}
      extras={[]}
    >
      <Stack sx={{ gap: 2 }}>
        <Typography variant="h6">Details</Typography>
        {/* <DataGrid clickable columns={columns} rows={data} /> */}
        <SummaryTable apiKey={apiKey} />
      </Stack>
    </SubmissionSummary>,
    <Box key="gap" sx={{ height: 72 }} />,
  ];

  const contentBottom = [
    <Button
      key="submit"
      startIcon={<CheckRounded />}
      disabled={keyStatus === "submitted" || keyStatus === "expired"}
      variant="contained"
      color="secondary"
      disableElevation
      size="large"
      sx={{ alignSelf: sm ? "stretch" : "flex-end", borderRadius: 2 }}
      onClick={() =>
        open({
          hintText,
          acceptLabel: "Submit now",
          acceptProps: { color: "primary" },
          closeLabel: "Cancel",
          onAccept: () => {
            finalise();
            close();
            navigate("/submissionSummary");
          },
          onClose: close,
        })
      }
    >
      Finish submission
    </Button>,
  ];

  return (
    <>
      <BentoLayout
        flat
        title={requestData?.algorithmName ?? "Submit data"}
        path={[
          { name: "Home", url: "/" },
          { name: "My submissions", url: "/track" },
        ]}
        contentLeft={contentLeft}
        contentRight={contentRight}
        labelLeft="Upload data"
        labelRight="Validation progress"
      />
      <Stack
        sx={{
          overflow: "hidden",
          position: "fixed",
          right: 0,
          left: sm ? 0 : "auto",
          p: sm ? 2 : 3,
          bottom: 0,
        }}
      >
        {contentBottom}
      </Stack>
      {dialog}
    </>
  );
}

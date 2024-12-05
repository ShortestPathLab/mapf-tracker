import { CheckOutlined } from "@mui/icons-material";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { Box, Button, Divider, Stack, Tab, Typography } from "@mui/material";
import { FlatCard } from "components/FlatCard";
import { ConfirmDialog } from "components/dialog/Modal";
import { Scroll } from "components/dialog/Scrollbars";
import { useSm } from "components/dialog/useSmallDisplay";
import { useDialog } from "hooks/useDialog";
import { useLocationState } from "hooks/useNavigation";
import { Layout } from "layout";
import { topbarHeight } from "layout/topbarHeight";
import { sumBy } from "lodash";
import { SubmissionLocationState } from "pages/submissions/SubmissionLocationState";
import {
  useFinaliseOngoingSubmissionMutation,
  useOngoingSubmissionSummaryQuery,
} from "queries/useOngoingSubmissionQuery";
import { useSubmissionKeyQuery } from "queries/useSubmissionKeyQuery";
import { useState } from "react";
import { Actions } from "./Actions";
import { parseApiKeyStatus } from "./parseApiKeyStatus";
import { SubmissionRequestGlance } from "./SubmissionRequestGlance";
import SubmissionSummary from "./SubmissionSummary";
import { Tickets } from "./Tickets";
import SummaryTable from "./table/SummaryTable";

const hintText =
  "You will not be able to edit this submission after it has been submitted. To make a new submission, you must request a new submission key. \n\nInvalid or dominated entries will be ignored.";

export default function SubmissionSummaryPage() {
  const { apiKey } = useLocationState<SubmissionLocationState>();
  const { data } = useOngoingSubmissionSummaryQuery(apiKey);
  const { data: apiKeyData } = useSubmissionKeyQuery(apiKey);
  const { mutate: finalise } = useFinaliseOngoingSubmissionMutation(apiKey);
  const { open, close, dialog } = useDialog(ConfirmDialog, {
    title: "Finish submission",
    slotProps: { modal: { variant: "default" } },
    padded: true,
  });

  const keyStatus = parseApiKeyStatus(apiKeyData);

  const sm = useSm();

  const contentLeft = [
    <SubmissionRequestGlance key="glance" apiKey={apiKey} />,
    <Actions key="actions" apiKey={apiKey} />,
    <Tickets key="tickets" apiKey={apiKey} />,
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
        <FlatCard>
          <SummaryTable apiKey={apiKey} />
        </FlatCard>
      </Stack>
    </SubmissionSummary>,
  ];

  const contentBottom = [
    <Button
      key="submit"
      startIcon={<CheckOutlined />}
      disabled={keyStatus === "submitted" || keyStatus === "expired"}
      variant="contained"
      disableElevation
      size="large"
      sx={{ alignSelf: sm ? "stretch" : "flex-end", bgcolor: "text.primary" }}
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
      Finish submission
    </Button>,
  ];

  const [tab, setTab] = useState("upload");

  return (
    <>
      <Layout
        flat
        title="Submit data"
        path={[
          { name: "Submit", url: "/submit" },
          { name: "Submit an algorithm", url: "/contributes" },
          { name: "Manage submissions", url: "/trackSubmission" },
        ]}
      >
        {sm ? (
          <>
            <TabContext value={tab}>
              <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                <TabList
                  onChange={(e, v) => setTab(v)}
                  aria-label="lab API tabs example"
                >
                  <Tab label="Upload" value="upload" />
                  <Tab label="Validation" value="validate" />
                </TabList>
              </Box>
              <TabPanel
                value="upload"
                sx={{ display: "flex", gap: 4, flexDirection: "column", p: 0 }}
              >
                {contentLeft}
              </TabPanel>
              <TabPanel
                value="validate"
                sx={{
                  display: "flex",
                  gap: 4,
                  flexDirection: "column",
                  p: 0,
                  mt: -6,
                }}
              >
                {contentRight}
              </TabPanel>
            </TabContext>
            {/* Gap for sticky footer */}
            <Box sx={{ height: 72 }} />
          </>
        ) : (
          <Stack
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              height: `calc(100dvh - ${topbarHeight(sm)}px)`,
              right: 0,
            }}
          >
            <Stack
              direction="row"
              sx={{
                bgcolor: "background.default",
                height: "100%",
              }}
            >
              <Scroll y style={{ flex: 0.3, minWidth: 460 }}>
                <Stack sx={{ gap: 4, p: 3, flex: 1 }}>
                  <Typography variant="h2">Upload data</Typography>
                  {contentLeft}
                  {/* Gap for sticky footer */}
                  <Box sx={{ height: 72 }} />
                </Stack>
              </Scroll>
              <Divider flexItem orientation="vertical" />
              <Scroll y style={{ flex: 1 }}>
                <Stack sx={{ gap: 4, p: 3, flex: 1 }}>
                  <Typography variant="h2" sx={{ mb: -2 }}>
                    Validation results
                  </Typography>
                  {contentRight}
                  {/* Gap for sticky footer */}
                  <Box sx={{ height: 72 }} />
                </Stack>
              </Scroll>
            </Stack>
          </Stack>
        )}
        {dialog}
      </Layout>
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
    </>
  );
}

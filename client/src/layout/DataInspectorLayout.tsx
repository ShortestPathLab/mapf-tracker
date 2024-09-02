import { FolderOutlined, ShowChartOutlined } from "@mui/icons-material";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { Stack, Tab } from "@mui/material";
import { useSm } from "components/dialog/useSmallDisplay";
import { ReactNode, useState } from "react";
import { setFromParam } from "utils/set";
import { FlatCard } from "components/FlatCard";

export function DataInspectorLayout({
  data: dataContent,
  dataTabName = "Browse benchmarks",
  analysisTabName = "Analyse dataset",
  analysis: analysisContent,
}: {
  dataTabName?: ReactNode;
  analysisTabName?: ReactNode;
  data?: ReactNode;
  analysis?: ReactNode;
}) {
  const [tab, setTab] = useState<"data" | "analysis">("data");
  const sm = useSm();
  return (
    <TabContext value={tab}>
      <Stack>
        <TabList
          variant="fullWidth"
          sx={{
            pb: 0,
            position: "sticky",
            top: 0,
            zIndex: 2,
            bgcolor: sm ? "background.paper" : "background.default",
            mx: sm ? -2 : 0,
            borderBottom: (t) => `1px solid ${t.palette.divider}`,
          }}
          onChange={setFromParam(setTab)}
        >
          <Tab
            sx={{ px: sm ? 2 : 6 }}
            label={dataTabName}
            value="data"
            icon={<FolderOutlined />}
          />
          <Tab
            sx={{ px: sm ? 2 : 6 }}
            label={analysisTabName}
            value="analysis"
            icon={<ShowChartOutlined />}
          />
        </TabList>
        {[
          { value: "data", content: dataContent },
          { value: "analysis", content: analysisContent },
        ].map(({ value, content }) => (
          <TabPanel sx={{ p: 0, pt: 2 }} value={value}>
            <FlatCard>{content}</FlatCard>
          </TabPanel>
        ))}
      </Stack>
    </TabContext>
  );
}

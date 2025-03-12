import { TabContext, TabList, TabPanel } from "@mui/lab";
import { Box, Stack, Tab } from "@mui/material";
import { FlatCard } from "components/FlatCard";
import { useXs } from "components/dialog/useSmallDisplay";
import { ReactNode, useState } from "react";
import { setFromParam } from "utils/set";
import { TabBar } from "./TabBar";

export function DataInspectorLayout({
  data: dataContent,
  dataTabName = "Browse solutions",
  analysisTabName = "Trends",
  compareTabName = "Compare",
  analysis: analysisContent,
  compare: compareContent,
}: {
  dataTabName?: ReactNode;
  analysisTabName?: ReactNode;
  compareTabName?: ReactNode;
  data?: ReactNode;
  analysis?: ReactNode;
  compare?: ReactNode;
}) {
  const [tab, setTab] = useState<"data" | "analysis" | "compare">("data");
  const sm = useXs();
  return (
    <TabContext value={tab}>
      <Stack>
        <TabBar sx={{ mx: sm ? -2 : -1, mb: sm ? 2 : 0 }}>
          <TabList onChange={setFromParam(setTab)}>
            {[
              { label: dataTabName, value: "data" },
              { label: analysisTabName, value: "analysis" },
              { label: compareTabName, value: "compare" },
            ].map(({ label, value }) => (
              <Tab
                sx={{ minWidth: 0, px: 0, mx: sm ? 2 : 0, mr: sm ? 2 : 4 }}
                label={label}
                value={value}
                key={value}
              />
            ))}
          </TabList>
        </TabBar>
        <Stack>
          {[
            {
              value: "data",
              content: <FlatCard>{dataContent}</FlatCard>,
            },
            {
              value: "analysis",
              content: (
                <Box sx={{ px: sm ? 2 : 0, py: 3 }}>{analysisContent}</Box>
              ),
            },
            {
              value: "compare",
              content: (
                <Box sx={{ px: sm ? 2 : 0, py: 3 }}>{compareContent}</Box>
              ),
            },
          ].map(({ value, content }) => (
            <TabPanel sx={{ p: 0 }} value={value} key={value}>
              {content}
            </TabPanel>
          ))}
        </Stack>
      </Stack>
    </TabContext>
  );
}

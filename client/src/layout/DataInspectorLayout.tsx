import { TabContext, TabList, TabPanel } from "@mui/lab";
import { Box, Stack, Tab } from "@mui/material";
import { FlatCard } from "components/FlatCard";
import { useSm } from "components/dialog/useSmallDisplay";
import { ReactNode, useState } from "react";
import { setFromParam } from "utils/set";
import { TabBar } from "./TabBar";

export function DataInspectorLayout({
  data: dataContent,
  dataTabName = "Browse solutions",
  analysisTabName = "Trends",
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
      <Stack sx={{ px: sm ? 0 : 2 }}>
        <TabBar>
          <TabList onChange={setFromParam(setTab)}>
            {[
              { label: dataTabName, value: "data" },
              { label: analysisTabName, value: "analysis" },
            ].map(({ label, value }) => (
              <Tab
                sx={{ minWidth: 0, px: sm ? 2 : 0, mr: sm ? 0 : 4 }}
                label={label}
                value={value}
                key={value}
              />
            ))}
          </TabList>
        </TabBar>
        {[
          {
            value: "data",
            content: <Box sx={{ py: sm ? 0 : 3 }}>{dataContent}</Box>,
          },
          {
            value: "analysis",
            content: (
              <Box sx={{ px: sm ? 2 : 0, py: 3 }}>{analysisContent}</Box>
            ),
          },
        ].map(({ value, content }) => (
          <TabPanel sx={{ p: 0, pt: 2 }} value={value} key={value}>
            <FlatCard>{content}</FlatCard>
          </TabPanel>
        ))}
      </Stack>
    </TabContext>
  );
}

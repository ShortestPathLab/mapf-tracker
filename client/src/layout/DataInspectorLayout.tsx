import { TabContext, TabList, TabPanel } from "@mui/lab";
import { Box, Stack, Tab, Typography } from "@mui/material";
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
              { label: dataTabName, value: "data", content: dataContent },
              {
                label: analysisTabName,
                value: "analysis",
                content: analysisContent,
              },
              {
                label: compareTabName,
                value: "compare",
                content: compareContent,
              },
            ]
              .filter((c) => c.content)
              .map(({ label, value }) => (
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
              content: (
                <Box sx={{ pt: 2 }}>
                  <FlatCard>{dataContent}</FlatCard>
                </Box>
              ),
            },
            {
              value: "analysis",
              content: (
                <Box sx={{ px: sm ? 2 : 0, py: 3 }}>
                  {analysisContent ?? (
                    <Typography color="text.secondary">No data</Typography>
                  )}
                </Box>
              ),
            },
            {
              value: "compare",
              content: (
                <Box sx={{ px: sm ? 2 : 0, py: 3 }}>
                  {compareContent ?? (
                    <Typography color="text.secondary"> No data</Typography>
                  )}
                </Box>
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

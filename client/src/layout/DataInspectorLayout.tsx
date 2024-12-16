import { TabContext, TabList, TabPanel } from "@mui/lab";
import { Box, Stack, Tab } from "@mui/material";
import { FlatCard } from "components/FlatCard";
import { useSm } from "components/dialog/useSmallDisplay";
import { ReactNode, useState } from "react";
import { setFromParam } from "utils/set";

export function DataInspectorLayout({
  data: dataContent,
  dataTabName = "Browse solutions",
  analysisTabName = "Analyse",
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
        <TabList
          variant={sm ? "fullWidth" : "standard"}
          sx={{
            position: "sticky",
            top: 0,
            mt: sm ? 0 : -2,
            pt: sm ? 0 : 2,
            pb: sm ? 0 : 2,
            zIndex: 2,
            bgcolor: "background.default",
            mx: -2,
          }}
          onChange={setFromParam(setTab)}
        >
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
        {[
          { value: "data", content: dataContent },
          {
            value: "analysis",
            content: (
              <Box sx={{ px: sm ? 2 : 0, py: sm ? 3 : 0 }}>
                {analysisContent}
              </Box>
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

import { TabContext, TabList, TabPanel } from "@mui/lab";
import { Stack, Tab } from "@mui/material";
import { FlatCard } from "components/FlatCard";
import { useSm } from "components/dialog/useSmallDisplay";
import { ReactNode, useState } from "react";
import { setFromParam } from "utils/set";

export function DataInspectorLayout({
  data: dataContent,
  dataTabName = "Browse",
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
      <Stack>
        <TabList
          variant={sm ? "fullWidth" : "standard"}
          sx={{
            pb: 0,
            zIndex: 2,
            bgcolor: "background.default",
            mx: sm ? -2 : 0,
            borderBottom: (t) => `1px solid ${t.palette.divider}`,
          }}
          onChange={setFromParam(setTab)}
        >
          <Tab
            sx={{ minWidth: 0, px: sm ? 2 : 0, mr: sm ? 0 : 4 }}
            label={dataTabName}
            value="data"
          />
          <Tab
            sx={{ minWidth: 0, px: sm ? 2 : 0, mr: sm ? 0 : 4 }}
            label={analysisTabName}
            value="analysis"
          />
        </TabList>
        {[
          { value: "data", content: dataContent },
          { value: "analysis", content: analysisContent },
        ].map(({ value, content }) => (
          <TabPanel sx={{ p: 0, pt: 2 }} value={value} key={value}>
            <FlatCard>{content}</FlatCard>
          </TabPanel>
        ))}
      </Stack>
    </TabContext>
  );
}

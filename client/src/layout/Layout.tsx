import { FolderOutlined, ShowChartOutlined } from "@mui/icons-material";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { Stack, Tab } from "@mui/material";
import { ReactNode, useState } from "react";
import { setFromParam } from "utils/set";
import PageHeader, { PageHeaderProps } from "./PageHeader";
import { useSm } from "components/dialog/useSmallDisplay";

export default function Layout({
  width = 1488,
  render = ({ header, children }) => (
    <>
      {header}
      {children}
    </>
  ),
  title,
  path,
  children,
}: {
  width?: number;
  children?: ReactNode;
  render?: (components: {
    header: ReactNode;
    children?: ReactNode;
  }) => ReactNode;
  title?: string;
  path?: PageHeaderProps["path"];
}) {
  const sm = useSm();
  return (
    <Stack sx={{ mx: "auto", width, maxWidth: "100%", gap: 4, py: sm ? 0 : 6 }}>
      {render({
        header: <PageHeader {...{ current: title, path }} />,
        children,
      })}
    </Stack>
  );
}

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
      <TabList
        variant="fullWidth"
        sx={{ borderBottom: (t) => `1px solid ${t.palette.divider}` }}
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
      <TabPanel sx={{ p: 0 }} value="data">
        {dataContent}
      </TabPanel>
      <TabPanel sx={{ p: 0 }} value="analysis">
        {analysisContent}
      </TabPanel>
    </TabContext>
  );
}

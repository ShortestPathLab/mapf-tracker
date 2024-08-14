import {
  ArrowBackOutlined,
  FolderOutlined,
  ShowChartOutlined,
} from "@mui/icons-material";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import {
  AppBar as MuiAppBar,
  Box,
  IconButton,
  Stack,
  Tab,
  Toolbar,
  Typography,
  Card,
} from "@mui/material";
import { useMd, useSm } from "components/dialog/useSmallDisplay";
import { ReactNode, useState } from "react";
import { setFromParam } from "utils/set";
import PageHeader, { PageHeaderProps } from "./PageHeader";
import AppBar from "components/appbar";
import { Scroll } from "components/dialog/Scrollbars";
import { last, startCase } from "lodash";
import { useNavigate } from "hooks/useNavigation";
import Enter from "components/dialog/Enter";
import { navbarHeight } from "components/Navbar";

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
  width?: string | number;
  children?: ReactNode;
  render?: (components: {
    header?: ReactNode;
    children?: ReactNode;
  }) => ReactNode;
  title?: string;
  path?: PageHeaderProps["path"];
}) {
  const navigate = useNavigate();
  const sm = useSm();
  const md = useMd();
  const header = <PageHeader {...{ current: title, path }} />;
  const content = (
    <Stack
      sx={{
        bgcolor: "background.default",
        gap: 4,
        px: sm ? 2 : 3,
        maxWidth: width,
        mx: "auto",
        py: sm ? 2 : 6,
      }}
    >
      {render({
        header,
        children,
      })}
    </Stack>
  );
  return (
    <Stack
      sx={{
        height: "100%",
        width: "100%",
        bgcolor: "background.default",
      }}
    >
      <AppBar />
      {md && path?.length > 1 && (
        <MuiAppBar
          position="fixed"
          sx={{ color: "text.primary", boxShadow: "none" }}
        >
          <Toolbar
            sx={{
              bgcolor: "background.paper",
              borderBottom: (t) => `1px solid ${t.palette.background.default}`,
            }}
          >
            <IconButton
              edge="start"
              onClick={() => {
                const { state, url } = last(path);
                navigate(url, state);
              }}
            >
              <ArrowBackOutlined />
            </IconButton>
            <Typography variant="h6" sx={{ ml: 1 }}>
              {startCase(title)}
            </Typography>
          </Toolbar>
        </MuiAppBar>
      )}
      <Scroll y style={{ flex: 1, transform: "translateZ(0)" }}>
        {md ? content : <Enter in>{content}</Enter>}
      </Scroll>
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
        sx={{
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
        <TabPanel sx={{ p: 0 }} value={value}>
          {sm ? <Box sx={{ m: -2 }}>{content}</Box> : <Card>{content}</Card>}
        </TabPanel>
      ))}
    </TabContext>
  );
}

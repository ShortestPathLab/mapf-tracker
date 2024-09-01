import {
  ArrowBackOutlined,
  FolderOutlined,
  ShowChartOutlined,
} from "@mui/icons-material";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import {
  Box,
  Card,
  Fade,
  IconButton,
  AppBar as MuiAppBar,
  Stack,
  StackProps,
  Tab,
  Toolbar,
  Typography,
  useScrollTrigger,
} from "@mui/material";
import AppBar, { appbarHeight } from "components/appbar";
import Enter from "components/dialog/Enter";
import { Scroll, useScroll } from "components/dialog/Scrollbars";
import { useMd, useSm } from "components/dialog/useSmallDisplay";
import { useNavigate } from "hooks/useNavigation";
import { last, merge, startCase } from "lodash";
import { ReactNode, useEffect, useState } from "react";
import { setFromParam } from "utils/set";
import PageHeader, { PageHeaderProps } from "./PageHeader";
import { FlatCard } from "components/FlatCard";
import { useScrollState } from "components/dialog/useScrollState";

export default function Layout({
  collapse = true,
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
  slotProps,
  flat,
}: {
  flat?: boolean;
  collapse?: boolean;
  width?: string | number;
  children?: ReactNode;
  render?: (components: {
    header?: ReactNode;
    children?: ReactNode;
  }) => ReactNode;
  title?: string;
  path?: PageHeaderProps["path"];
  slotProps?: { content?: StackProps };
}) {
  const md = useMd();
  const [, isTop, , , setPanel] = useScrollState(appbarHeight(md));
  const navigate = useNavigate();
  const sm = useSm();
  const header = <PageHeader {...{ current: title, path }} />;
  const content = (
    <Stack
      {...merge(
        {
          sx: {
            bgcolor: "background.default",
            gap: 4,
            px: sm ? 2 : 3,
            maxWidth: width,
            mx: "auto",
            py: sm ? 2 : 6,
          },
        },
        slotProps?.content
      )}
    >
      {render({
        header: !md || collapse ? header : undefined,
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
              bgcolor:
                flat && isTop ? "background.default" : "background.paper",
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
            <Fade in={!isTop || !collapse}>
              <Typography variant="h6" sx={{ ml: 1 }}>
                {startCase(title)}
              </Typography>
            </Fade>
          </Toolbar>
        </MuiAppBar>
      )}
      <Scroll
        y
        style={{ flex: 1, transform: "translateZ(0)" }}
        ref={(p) => setPanel(p)}
      >
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

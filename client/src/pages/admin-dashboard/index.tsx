import {
  DashboardOutlined,
  FeedOutlined,
  KeyOutlined,
} from "@mui/icons-material";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { Box, Stack, Tab, Tabs } from "@mui/material";
import { Scroll } from "components/dialog/Scrollbars";
import { useSm } from "components/dialog/useSmallDisplay";
import { useNavigate } from "hooks/useNavigation";
import { head } from "lodash";
import { Route, Routes, useParams } from "react-router-dom";
import SubmissionKeyRequestsPage from "./submission-key-requests";
import DashboardPage from "./dashboard";

const pages = [
  {
    value: "",
    label: "Dashboard",
    content: <DashboardPage />,
    icon: <DashboardOutlined />,
  },
  {
    value: "submission-key-requests",
    label: "Submission key requests",
    content: <SubmissionKeyRequestsPage />,
    icon: <FeedOutlined />,
  },
  {
    value: "api-keys",
    label: "API keys",
    content: <></>,
    icon: <KeyOutlined />,
  },
];

export default function index() {
  const sm = useSm();
  const { section } = useParams();
  const navigate = useNavigate();
  return (
    <TabContext value={section ?? head(pages).value}>
      <Stack
        direction="row"
        sx={{ position: "fixed", top: 88, left: 0, bottom: 0, right: 0 }}
      >
        <Tabs
          value={section ?? head(pages).value}
          onChange={(_, v) => navigate(`/dashboard/${v}`)}
          orientation="vertical"
          sx={{
            borderRight: (t) => `1px solid ${t.palette.divider}`,
            minWidth: 280,
          }}
        >
          {pages.map(({ content, ...page }) => (
            <Tab
              {...page}
              iconPosition="start"
              sx={{ justifyContent: "flex-start", px: 3, minHeight: 64 }}
            />
          ))}
        </Tabs>
        <Box sx={{ flex: 1, overflow: "hidden", height: "100%" }}>
          {pages.map(({ value, content }) => (
            <TabPanel value={value} sx={{ p: 0, height: "100%" }}>
              <Scroll y style={{ height: "100%" }}>
                <Box sx={{ p: sm ? 2 : 3 }}>{content}</Box>
              </Scroll>
            </TabPanel>
          ))}
        </Box>
      </Stack>
    </TabContext>
  );
}

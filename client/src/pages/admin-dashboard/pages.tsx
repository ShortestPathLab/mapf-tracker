import {
  CallReceivedOutlined,
  DashboardOutlined,
  SpaceDashboardOutlined,
  VpnKeyOutlined,
} from "@mui/icons-material";
import ApiKeysPage from "./api-keys";
import OverviewPage from "./overview";
import SubmissionKeyRequestsPage from "./submission-key-requests";

export const pages = () => [
  {
    value: "",
    label: "Overview",
    description: "",
    content: <OverviewPage />,
    icon: <SpaceDashboardOutlined />,
  },
  {
    value: "submission-key-requests",
    label: "Submission key requests",
    description: "Review submission requests, generate and send API keys",
    content: <SubmissionKeyRequestsPage />,
    icon: <CallReceivedOutlined />,
  },
  {
    value: "api-keys",
    label: "API keys",
    description: "Manage submission (API) keys",
    content: <ApiKeysPage />,
    icon: <VpnKeyOutlined />,
  },
];

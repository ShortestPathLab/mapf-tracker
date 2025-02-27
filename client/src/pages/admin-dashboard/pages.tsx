import {
  AccountTreeOutlined,
  BarChartOutlined,
  CallReceivedOutlined,
  SpaceDashboardOutlined,
  VpnKeyOutlined,
} from "@mui-symbols-material/w400";
import { once } from "lodash";
import ApiKeysPage from "./api-keys";
import OverviewPage from "./overview";
import PipelinesPage from "./pipelines";
import StatisticsPage from "./statistics";
import SubmissionKeyRequestsPage from "./submission-key-requests";

export const pages = once(() => [
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
  {
    value: "pipelines",
    label: "Pipelines",
    description: "View and run data-processing jobs",
    content: <PipelinesPage />,
    icon: <AccountTreeOutlined />,
  },
  {
    value: "statistics",
    label: "Statistics",
    description: "View statistics",
    content: <StatisticsPage />,
    icon: <BarChartOutlined />,
  },
]);

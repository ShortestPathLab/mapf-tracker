import {
  AccountTreeRounded,
  CallReceivedRounded,
  PersonRounded,
  SpaceDashboardRounded,
  VpnKeyRounded,
} from "@mui-symbols-material/w400";
import { once } from "lodash";
import AdminUsersPage from "./admin-users";
import ApiKeysPage from "./api-keys";
import OverviewPage from "./overview";
import PipelinesPage from "./pipelines";
import SubmissionKeyRequestsPage from "./submission-key-requests";
import InfoPage from "./info";

export const pages = once(() => [
  {
    value: "",
    label: "Overview",
    description: "",
    content: <OverviewPage />,
    icon: <SpaceDashboardRounded />,
  },
  {
    value: "submission-key-requests",
    label: "Submission key requests",
    description: "Review submission requests, generate and send API keys",
    content: <SubmissionKeyRequestsPage />,
    icon: <CallReceivedRounded />,
  },
  {
    value: "api-keys",
    label: "API keys",
    description: "Manage submission (API) keys",
    content: <ApiKeysPage />,
    icon: <VpnKeyRounded />,
  },
  {
    value: "admin-users",
    label: "Admin users",
    description: "Manage users who can access management options",
    content: <AdminUsersPage />,
    icon: <PersonRounded />,
  },
  {
    value: "pipelines",
    label: "Actions",
    description: "View and run data-processing jobs",
    content: <PipelinesPage />,
    icon: <AccountTreeRounded />,
  },
  {
    value: "info",
    label: "Info",
    description: "View platform information",
    content: <InfoPage />,
    icon: <AccountTreeRounded />,
  },
  // {
  //   value: "statistics",
  //   label: "Statistics",
  //   description: "View statistics",
  //   content: <StatisticsPage />,
  //   icon: <BarChartRounded />,
  // },
]);

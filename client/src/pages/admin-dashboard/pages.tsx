import {
  AccountTreeRounded,
  BarChartRounded,
  CallReceivedRounded,
  SpaceDashboardRounded,
  VpnKeyRounded,
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
    value: "pipelines",
    label: "Pipelines",
    description: "View and run data-processing jobs",
    content: <PipelinesPage />,
    icon: <AccountTreeRounded />,
  },
  {
    value: "statistics",
    label: "Statistics",
    description: "View statistics",
    content: <StatisticsPage />,
    icon: <BarChartRounded />,
  },
]);

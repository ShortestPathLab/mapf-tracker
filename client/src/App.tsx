import {
  Build,
  BuildOutlined,
  FileUploadOutlined,
  Home,
  HomeOutlined,
} from "@mui/icons-material";
import {
  BottomNavigation,
  BottomNavigationAction,
  Box,
  Stack,
} from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { LostConnectionWarning } from "components/LostConnectionWarning";
import { Route, Router } from "components/Router";
import AppBar from "components/appbar";
import { useLg } from "components/dialog/useSmallDisplay";
import {
  ModalContext,
  useModalProviderValue,
} from "hooks/useModalProviderValue";
import { useNavigate } from "hooks/useNavigation";
import { find } from "lodash";
import { ConfirmProvider } from "material-ui-confirm";
import { NotFoundPage } from "pages/NotFound";
import BenchmarksMapLevelPage from "pages/benchmarks-map-level";
import BenchmarksRootLevelPage from "pages/benchmarks-root-level";
import BenchmarksScenarioLevelPage from "pages/benchmarks-scenario-level";
import DirectoryPage from "pages/directory";
import SystemDemo from "pages/docs/demo";
import SubmissionSummaryPage from "pages/submission-summary";
import { useMemo, useReducer } from "react";
import { matchPath, useLocation } from "react-router-dom";
import "./App.css";
import { SnackbarProvider } from "./components/Snackbar";
import { useTitleBar } from "./hooks/useTitleBar";
import Submissions from "./pages/AlgorithmsPage";
import UserMapPage from "./pages/UserMapPage";
import AdminDashboard from "./pages/admin-dashboard";
import AdminDashboardOld from "./pages/admin-dashboard/index.old";
import ContributePage from "./pages/contribute";
import DocsPage from "./pages/docs";
import AboutPage from "./pages/docs/about";
import DownloadPage from "./pages/docs/get-dataset";
import TrackSubmission from "./pages/submissions";
import Summary from "./pages/summary/DashboardPage";
import Visualiser from "./pages/visualiser";
import { theme } from "./theme";
import { ThemeContext } from "./utils/ThemeProvider";

export const queryClient = new QueryClient();

export default function App() {
  const themeState = useReducer((prev) => {
    const next = prev === "light" ? "dark" : "light";
    localStorage.setItem("theme", next);
    return next;
  }, (localStorage.getItem("theme") || "dark") as "light" | "dark");
  const [mode] = themeState;
  const modalProviderValue = useModalProviderValue();

  const t = useMemo(() => theme(mode), [mode]);

  useTitleBar(mode === "dark" ? "#17191d" : "#ffffff");
  return (
    <QueryClientProvider client={queryClient}>
      <ModalContext.Provider value={modalProviderValue}>
        <ThemeContext.Provider value={themeState}>
          <ThemeProvider theme={t}>
            <ConfirmProvider>
              <SnackbarProvider>
                <Content />
                <ReactQueryDevtools />
              </SnackbarProvider>
            </ConfirmProvider>
          </ThemeProvider>
        </ThemeContext.Provider>
      </ModalContext.Provider>
    </QueryClientProvider>
  );
}
export function Content() {
  const lg = useLg();

  const routes: Route[] = [
    {
      path: "/",
      content: <DirectoryPage labels={["Browse", "Docs"]} />,
    },
    {
      path: "/submit",
      content: <DirectoryPage labels={["Make a submission"]} title="Submit" />,
    },
    {
      path: "/docs",
      content: <DocsPage />,
      parent: "/",
    },
    {
      path: "/manage",
      content: (
        <DirectoryPage labels={["Appearance", "Manage"]} title="Manage" />
      ),
    },
    {
      path: "/benchmarks",
      content: <BenchmarksRootLevelPage />,
      parent: "/",
    },
    {
      path: "/scenarios",
      content: <BenchmarksMapLevelPage />,
      parent: "/benchmarks",
    },
    {
      path: "/instances",
      content: <BenchmarksScenarioLevelPage />,
      parent: "/scenarios",
    },
    { path: "/visualization", content: <Visualiser />, parent: "/instances" },
    { path: "/summary", content: <Summary />, parent: "/" },
    { path: "/about", content: <AboutPage />, parent: "/docs" },
    { path: "/systemDemo", content: <SystemDemo />, parent: "/docs" },
    { path: "/submissions", content: <Submissions />, parent: "/" },
    { path: "/contributes", content: <ContributePage />, parent: "submit" },
    {
      path: "/trackSubmission",
      content: <TrackSubmission />,
      parent: "/submit",
    },
    {
      path: "/submissionSummary",
      content: <SubmissionSummaryPage />,
      parent: "/trackSubmission",
    },
    { path: "/download", content: <DownloadPage />, parent: "/docs" },
    {
      path: "/dashboard/:section?",
      content: <AdminDashboard />,
    },
    {
      path: "/dashboard-old",
      content: <AdminDashboardOld />,
    },
    {
      path: "/user/maps",
      content: <UserMapPage />,
    },
  ];
  return (
    <>
      <Stack>
        <Stack
          direction={lg ? "column" : "row"}
          sx={{
            height: "100%",
            width: "100%",
            bgcolor: "background.default",
          }}
        >
          <AppBar />
          <Box sx={{ flex: 1, overflowX: "hidden" }}>
            <Router fallback={<NotFoundPage />} routes={routes} />
          </Box>
        </Stack>
        {lg && <BottomBar />}
      </Stack>
      <LostConnectionWarning />
    </>
  );
}

function BottomBar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const paths = [
    {
      label: "Browse",
      url: "/",
      icon: <HomeOutlined />,
      iconSelected: <Home />,
    },
    {
      label: "Submit",
      url: "/submit",
      icon: <FileUploadOutlined />,
      iconSelected: <FileUploadOutlined />,
    },
    {
      label: "Manage",
      url: "/manage",
      icon: <BuildOutlined />,
      iconSelected: <Build />,
    },
  ];
  const selected = find(
    paths,
    (c) => !!matchPath(`${c?.url}/*`, pathname)
  )?.url;
  return (
    <BottomNavigation
      showLabels
      value={selected}
      sx={{
        transition: (t) => t.transitions.create("transform"),
        transform: selected ? "translateY(0)" : "translateY(100%)",
        zIndex: (t) => t.zIndex.appBar + 1,
        position: "fixed",
        height: "max-content",
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      {paths.map(({ label, url, icon, iconSelected }) => (
        <BottomNavigationAction
          key={label}
          sx={{
            pt: 1.5,
            pb: 2,
            "> svg": { transform: "scale(0.9)", mb: 0.5 },
            "> span": { fontWeight: 550 },
            "&.Mui-selected": {
              "> span": { fontSize: "0.75rem" },
            },
          }}
          value={url}
          label={label}
          icon={selected === url ? iconSelected : icon}
          onClick={() => navigate(url)}
        />
      ))}
    </BottomNavigation>
  );
}

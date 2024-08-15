import { Box } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Route, Router } from "components/Router";
import {
  ModalContext,
  useModalProviderValue,
} from "hooks/useModalProviderValue";
import { ConfirmProvider } from "material-ui-confirm";
import BenchmarksMapLevelPage from "pages/benchmarks-map-level";
import BenchmarksRootLevelPage from "pages/benchmarks-root-level";
import BenchmarksScenarioLevelPage from "pages/benchmarks-scenario-level";
import SystemDemo from "pages/demo";
import SubmissionSummaryPage from "pages/submission-summary";
import { useMemo, useReducer } from "react";
import { Navigate } from "react-router-dom";
import "./App.css";
import { SnackbarProvider } from "./components/Snackbar";
import { useTitleBar } from "./hooks/useTitleBar";
import Submissions from "./pages/AlgorithmsPage";
import UserMapPage from "./pages/UserMapPage";
import AboutPage from "./pages/about";
import AdminDashboard from "./pages/admin-dashboard";
import AdminDashboardOld from "./pages/admin-dashboard/index.old";
import ContributePage from "./pages/contribute";
import DownloadPage from "./pages/get-dataset";
import TrackSubmission from "./pages/submissions";
import Summary from "./pages/summary/DashboardPage";
import Visualiser from "./pages/visualiser";
import { theme } from "./theme";
import { ThemeContext } from "./utils/ThemeProvider";
import { NotFound } from "pages/NotFound";
import { useCredentials } from "queries/useLogInQuery";

export const queryClient = new QueryClient();

export default function App() {
  const themeState = useReducer((prev) => {
    const next = prev === "light" ? "dark" : "light";
    localStorage.setItem("theme", next);
    return next;
  }, (localStorage.getItem("theme") || "dark") as any);
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
  const { data: credentials } = useCredentials();
  const routes: Route[] = [
    { path: "/", content: <BenchmarksRootLevelPage showHeader /> },
    { path: "/benchmarks", content: <BenchmarksRootLevelPage /> },
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
    { path: "/summary", content: <Summary /> },
    { path: "/about", content: <AboutPage /> },
    { path: "/systemDemo", content: <SystemDemo /> },
    { path: "/submissions", content: <Submissions /> },
    {
      path: "/submissionSummary",
      content: <SubmissionSummaryPage />,
      parent: "/submissions",
    },
    { path: "/contributes", content: <ContributePage /> },
    {
      path: "/trackSubmission",
      content: <TrackSubmission />,
      parent: "/contributes",
    },
    { path: "/download", content: <DownloadPage /> },
    {
      path: "/dashboard/:section?",
      content: credentials ? <AdminDashboard /> : <Navigate to="/" />,
    },
    {
      path: "/dashboard-old",
      content: credentials ? <AdminDashboardOld /> : <Navigate to="/" />,
    },
    {
      path: "/user/maps",
      content: credentials ? <UserMapPage /> : <Navigate to="/" />,
    },
  ];
  return (
    <Router
      fallback={<NotFound />}
      routes={routes.map(({ content, ...props }) => ({
        ...props,
        content: (
          <Box
            sx={{
              width: "100dvw",
              height: "100dvh",
              position: "absolute",
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
            }}
          >
            {content}
          </Box>
        ),
      }))}
    />
  );
}

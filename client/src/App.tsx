import { Box, Fade, Stack } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import Navbar from "components/Navbar";
import { ConfirmProvider } from "material-ui-confirm";
import BenchmarksMapLevelPage from "pages/benchmarks-map-level";
import BenchmarksRootLevelPage from "pages/benchmarks-root-level";
import BenchmarksScenarioLevelPage from "pages/benchmarks-scenario-level";
import SystemDemo from "pages/demo";
import SubmissionSummaryPage from "pages/submission-summary";
import { useMemo, useReducer } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import "./App.css";
import { SnackbarProvider } from "./components/Snackbar";
import { useTitleBar } from "./hooks/useTitleBar";
import AboutPage from "./pages/about";
import Submissions from "./pages/AlgorithmsPage";
import ContributePage from "./pages/contribute";
import AdminDashboard from "./pages/admin-dashboard";
import AdminDashboardOld from "./pages/admin-dashboard/index.old";
import Summary from "./pages/summary/DashboardPage";
import DownloadPage from "./pages/get-dataset";
import TrackSubmission from "./pages/submissions";
import UserMapPage from "./pages/UserMapPage";
import { Visualiser } from "./pages/visualiser";
import { theme } from "./theme";
import { ThemeContext } from "./utils/ThemeProvider";
import {
  useModalProviderValue,
  ModalContext,
} from "hooks/useModalProviderValue";

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

  const { pathname } = useLocation();

  useTitleBar(mode === "dark" ? "#15181c" : "#ffffff");

  return (
    <QueryClientProvider client={queryClient}>
      <ModalContext.Provider value={modalProviderValue}>
        <ThemeContext.Provider value={themeState}>
          <ThemeProvider theme={t}>
            <ConfirmProvider>
              <SnackbarProvider>
                <Stack
                  sx={{
                    bgcolor: "background.default",
                    minHeight: "100svh",
                    color: "text.primary",
                    transition: (t) => t.transitions.create("background-color"),
                  }}
                >
                  <Navbar />
                  <Box sx={{ pb: 32, position: "relative" }}>
                    <Fade in={true}>
                      <Stack>
                        <Routes>
                          <Route
                            path="/"
                            element={<BenchmarksRootLevelPage showHeader />}
                          />
                          <Route
                            path="/benchmarks"
                            element={<BenchmarksRootLevelPage />}
                          />
                          <Route
                            path="/scenarios"
                            element={<BenchmarksMapLevelPage />}
                          />
                          <Route
                            path="/instances"
                            element={<BenchmarksScenarioLevelPage />}
                          />
                          <Route
                            path="/visualization"
                            element={<Visualiser />}
                          />
                          <Route path="/summary" element={<Summary />} />
                          <Route path="/aboutUs" element={<AboutPage />} />
                          <Route path="/systemDemo" element={<SystemDemo />} />
                          <Route
                            path="/submissions"
                            element={<Submissions />}
                          />
                          <Route
                            path="/submissionSummary"
                            element={<SubmissionSummaryPage />}
                          />
                          <Route
                            path="/contributes"
                            element={<ContributePage />}
                          />
                          <Route path="/download" element={<DownloadPage />} />
                          <Route
                            path="/trackSubmission"
                            element={<TrackSubmission />}
                          />
                          <Route
                            path="/dashboard/:section?"
                            element={
                              localStorage.getItem("user") !== null ? (
                                <AdminDashboard />
                              ) : (
                                <Navigate to="/" />
                              )
                            }
                          />
                          <Route
                            path="/dashboard-old"
                            element={
                              localStorage.getItem("user") !== null ? (
                                <AdminDashboardOld />
                              ) : (
                                <Navigate to="/" />
                              )
                            }
                          />
                          <Route
                            path="/user/maps"
                            element={
                              localStorage.getItem("user") !== null ? (
                                <UserMapPage />
                              ) : (
                                <Navigate to="/" />
                              )
                            }
                          />
                        </Routes>
                      </Stack>
                    </Fade>
                  </Box>
                </Stack>
                <ReactQueryDevtools />
              </SnackbarProvider>
            </ConfirmProvider>
          </ThemeProvider>
        </ThemeContext.Provider>
      </ModalContext.Provider>
    </QueryClientProvider>
  );
}

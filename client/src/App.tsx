import { Box, Fade, Stack } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConfirmProvider } from "material-ui-confirm";
import BenchmarksMapLevelPage from "pages/benchmarks-map-level";
import BenchmarksRootLevelPage from "pages/benchmarks-root-level";
import BenchmarksScenarioLevelPage from "pages/benchmarks-scenario-level";
import { useMemo, useReducer } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import AboutUs from "./AboutUsPage";
import "./App.css";
import Contribute from "./ContributePage";
import Dashboard from "./Dashboard";
import Download from "./DownloadPage";
import Navbar from "./Navbar";
import MapTable from "./pages/benchmarks-root-level/Benchmarks.old";
import { Visualiser } from "./pages/visualiser";
import Paper from "./PaperPage";
import ScenarioTable from "./ScenarioTable";
import { SnackbarProvider } from "./Snackbar";
import SolutionPage from "./SolutionPage";
import Submissions from "./Submissions";
import SubmissionSummary from "./SubmissionSummary";
import Summary from "./Summary";
import SystemDemo from "./SystemDemo";
import { theme } from "./theme";
import { ThemeContext } from "./ThemeProvider";
import TrackSubmission from "./TrackSubmission";
import UserMapPage from "./UserMapPage";
import { useTitleBar } from "./useTitleBar";

const queryClient = new QueryClient();

export default function App() {
  const themeState = useReducer((prev) => {
    const next = prev === "light" ? "dark" : "light";
    localStorage.setItem("theme", next);
    return next;
  }, (localStorage.getItem("theme") || "dark") as any);
  const [mode] = themeState;

  const t = useMemo(() => theme(mode), [mode]);

  const { pathname } = useLocation();

  useTitleBar(mode === "dark" ? "#15181c" : "#ffffff");

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeContext.Provider value={themeState}>
        <ThemeProvider theme={t}>
          <ConfirmProvider>
            <SnackbarProvider>
              <Stack
                sx={{
                  bgcolor: "background.default",
                  minHeight: "100svh",
                  color: "text.primary",
                }}
              >
                <Navbar />
                <Box
                  sx={{ px: 4, pb: 32, position: "relative" }}
                  key={pathname === "/" ? "/benchmarks" : pathname}
                >
                  <Fade in={true}>
                    <Stack>
                      <Routes>
                        <Route
                          path="/benchmarks-old"
                          element={<MapTable showHeader={false} />}
                        />
                        <Route
                          path="/"
                          element={<BenchmarksRootLevelPage showHeader />}
                        />
                        <Route
                          path="/benchmarks"
                          element={<BenchmarksRootLevelPage />}
                        />
                        <Route
                          path="/scenarios-old"
                          element={<ScenarioTable />}
                        />
                        <Route
                          path="/scenarios"
                          element={<BenchmarksMapLevelPage />}
                        />
                        <Route
                          path="/instances-old"
                          element={<SolutionPage />}
                        />
                        <Route
                          path="/instances"
                          element={<BenchmarksScenarioLevelPage />}
                        />
                        <Route path="/visualization" element={<Visualiser />} />
                        <Route path="/summary" element={<Summary />} />
                        <Route path="/aboutUs" element={<AboutUs />} />
                        <Route path="/systemDemo" element={<SystemDemo />} />
                        <Route path="/submissions" element={<Submissions />} />
                        <Route
                          path="/submissionSummary"
                          element={<SubmissionSummary />}
                        />
                        <Route path="/contributes" element={<Contribute />} />
                        <Route path="/download" element={<Download />} />
                        <Route path="/papers" element={<Paper />} />
                        <Route
                          path="/trackSubmission"
                          element={<TrackSubmission />}
                        />
                        <Route
                          path="/dashboard"
                          element={
                            localStorage.getItem("user") !== null ? (
                              <Dashboard />
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
            </SnackbarProvider>
          </ConfirmProvider>
        </ThemeProvider>
      </ThemeContext.Provider>
    </QueryClientProvider>
  );
}

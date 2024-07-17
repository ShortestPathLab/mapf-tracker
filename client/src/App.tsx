import React, { useMemo, useReducer } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import "./App.css";
import MapTable from "./MapTable";
import Navbar from "./Navbar";

import AboutUs from "./AboutUsPage";
import Contribute from "./ContributePage";
import Dashboard from "./Dashboard";
import Download from "./DownloadPage";
import Paper from "./PaperPage";
import ScenarioTable from "./ScenarioTable";
import SolutionPage from "./SolutionPage";
import Submissions from "./Submissions";
import Summary from "./Summary";
import SystemDemo from "./SystemDemo";
import TrackSubmission from "./TrackSubmission";
import UserMapPage from "./UserMapPage";
import { Visualiser } from "./visualiser";

import { Box, Fade, Stack, alpha } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { ConfirmProvider } from "material-ui-confirm";
import { Navigate } from "react-router-dom";
import SubmissionSummary from "./SubmissionSummary";

import { SnackbarProvider } from "./Snackbar";
import { ThemeContext } from "./ThemeProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

const theme = (t: "light" | "dark") =>
  createTheme({
    palette: {
      mode: t,
      background:
        t === "light"
          ? { default: "#eaeaea", paper: "#ffffff" }
          : { default: "#111317", paper: "#17191d" },
    },
    shape: { borderRadius: 8 },
    shadows: [
      "none",
      "none",
      "none",
      "none",
      "none",
      "none",
      "none",
      "none",
      `0px 0px 0px 1px ${alpha("#111317", 0.1)}`,
      "none",
      "none",
      "none",
      "none",
      "none",
      "none",
      "none",
      "none",
      "none",
      "none",
      "none",
      "none",
      "none",
      "none",
      "none",
      "none",
    ],
    typography: {
      allVariants: {
        fontFamily:
          '"Inter Tight", "Inter", "Roboto Slab", "Helvetica", "Arial", sans-serif',
        letterSpacing: "0px",
        fontWeight: 450,
      },
      h1: { fontWeight: 550, fontSize: 42 },
      h2: { fontWeight: 550, fontSize: 36 },
      h3: { fontWeight: 550, fontSize: 24 },
      h4: { fontWeight: 550, fontSize: 24 },
      h5: { fontWeight: 550, fontSize: 20 },
      h6: { fontWeight: 550, fontSize: 18 },
      button: { textTransform: "none", fontWeight: 550 },
    },
    components: {
      MuiButton: {
        styleOverrides: { contained: { padding: "16px 32px" } },
      },
    },
  });

export default function App() {
  const themeState = useReducer((prev) => {
    const next = prev === "light" ? "dark" : "light";
    localStorage.setItem("theme", next);
    return next;
  }, (localStorage.getItem("theme") || "dark") as any);
  const [mode] = themeState;
  const t = useMemo(() => theme(mode), [mode]);
  const [screenWidth, setScreenWidth] = React.useState(window.innerWidth);

  React.useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const { pathname } = useLocation();

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
                        <Route path="/" element={<MapTable />} />
                        <Route
                          path="/benchmarks"
                          element={<MapTable showHeader={false} />}
                        />
                        <Route path="/scenarios" element={<ScenarioTable />} />
                        <Route path="/instances" element={<SolutionPage />} />
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

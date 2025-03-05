import {
  BottomNavigation,
  BottomNavigationAction,
  Box,
  Stack,
} from "@mui/material";
import { alpha, ThemeProvider } from "@mui/material/styles";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { bottomBarPaths } from "bottomBarPaths";
import { LostConnectionWarning } from "components/LostConnectionWarning";
import { Router } from "components/Router";
import AppBar from "components/appbar";
import { useSm } from "components/dialog/useSmallDisplay";
import {
  ModalContext,
  useModalProviderValue,
} from "hooks/useModalProviderValue";
import { useNavigate } from "hooks/useNavigation";
import { find } from "lodash";
import { ConfirmProvider } from "material-ui-confirm";
import { NotFoundPage } from "pages/NotFound";
import { useMemo, useReducer } from "react";
import { matchPath, useLocation } from "react-router-dom";
import { routes } from "routes";
import "./App.css";
import { SnackbarProvider } from "./components/Snackbar";
import { useTitleBar } from "./hooks/useTitleBar";
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

  useTitleBar(mode === "dark" ? "#17191d" : "#f0f4f9");
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
  const lg = useSm();
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
  const selected = find(
    bottomBarPaths,
    (c) => !!matchPath(`${c?.url}/*`, pathname)
  )?.url;
  return (
    <BottomNavigation
      showLabels
      value={selected}
      sx={{
        bgcolor: "background.default",
        transition: (t) => t.transitions.create("transform"),
        transform: selected ? "translateY(0)" : "translateY(100%)",
        zIndex: (t) => t.zIndex.appBar + 1,
        position: "fixed",
        height: (t) => t.spacing(10),
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      {bottomBarPaths.map(({ label, url, icon, iconSelected }) => (
        <BottomNavigationAction
          disableRipple
          key={label}
          sx={{
            height: (t) => t.spacing(10),
            display: "flex",
            justifyContent: "center",
            "> svg": { transform: "scale(0.9)", mb: 0.5 },
            "> span": { fontWeight: 550, mt: 0.5 },
            "&::after": {
              opacity: 0,
              content: "''",
              display: "block",
              width: (t) => t.spacing(8),
              height: (t) => t.spacing(4),
              borderRadius: 4,
              position: "absolute",
              top: (t) => t.spacing(1.6),
              mx: "auto",
              bgcolor: (t) => alpha(t.palette.primary.main, 0.1),
              transition: (t) => t.transitions.create("opacity"),
            },
            "&.Mui-selected": {
              "&::after": { opacity: 1 },
              "> svg": { color: "text.primary" },
              "> span": { fontSize: "0.75rem", color: "text.primary" },
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

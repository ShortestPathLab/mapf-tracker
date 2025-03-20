import { Box, Fade, LinearProgress, Stack } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import {
  QueryClient,
  QueryClientProvider,
  useIsMutating,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { BottomBar } from "BottomBar";
import { LostConnectionWarning } from "components/LostConnectionWarning";
import { Router } from "components/Router";
import AppBar from "components/appbar/index";
import { useXs } from "components/dialog/useSmallDisplay";
import {
  ModalContext,
  useModalProviderValue,
} from "hooks/useModalProviderValue";
import { HistoryProvider } from "hooks/useNavigation";
import { ConfirmProvider } from "material-ui-confirm";
import { NotFoundPage } from "pages/NotFound";
import { ReactNode, createContext, useContext, useMemo, useState } from "react";
import { routes } from "routes";
import { OptionsContext, useOptionsState } from "utils/OptionsProvider";
import "./App.css";
import { SnackbarProvider } from "./components/Snackbar";
import { useTitleBar } from "./hooks/useTitleBar";
import { theme } from "./theme";
import { ThemeContext, useThemeState } from "./utils/ThemeProvider";

export const queryClient = new QueryClient();

export const BottomBarContext = createContext<{
  enabled: boolean;
  setEnabled: (e: boolean) => void;
}>({
  enabled: true,
  setEnabled: () => {},
});

export const useBottomBar = () => useContext(BottomBarContext);

export const BottomBarProvider = ({ children }: { children: ReactNode }) => {
  const [enabled, setEnabled] = useState(true);
  const xs = useXs();
  const enabled1 = xs && enabled;
  const value = useMemo(
    () => ({ enabled: enabled1, setEnabled }),
    [enabled1, setEnabled]
  );
  return (
    <BottomBarContext.Provider value={value}>
      {children}
    </BottomBarContext.Provider>
  );
};

export default function App() {
  const themeState = useThemeState();
  const [mode] = themeState;
  const optionsState = useOptionsState();
  const modalProviderValue = useModalProviderValue();

  const t = useMemo(() => theme(mode), [mode]);

  useTitleBar(t.palette.background.default);
  return (
    <QueryClientProvider client={queryClient}>
      <ModalContext.Provider value={modalProviderValue}>
        <ThemeContext.Provider value={themeState}>
          <ThemeProvider theme={t}>
            <BottomBarProvider>
              <OptionsContext.Provider value={optionsState}>
                <ConfirmProvider>
                  <SnackbarProvider>
                    <HistoryProvider>
                      <Content />
                      <MutatingBar />
                      <ReactQueryDevtools buttonPosition="bottom-left" />
                    </HistoryProvider>
                  </SnackbarProvider>
                </ConfirmProvider>
              </OptionsContext.Provider>
            </BottomBarProvider>
          </ThemeProvider>
        </ThemeContext.Provider>
      </ModalContext.Provider>
    </QueryClientProvider>
  );
}

export function MutatingBar() {
  const isMutating = useIsMutating();
  return (
    <Fade in={!!isMutating}>
      <LinearProgress
        sx={{
          bottom: 0,
          position: "fixed",
          left: 0,
          width: "100%",
          zIndex: (t) => t.zIndex.appBar + 1,
        }}
        variant="indeterminate"
      />
    </Fade>
  );
}

export function Content() {
  const xs = useXs();
  return (
    <>
      <Stack>
        <Stack
          direction={xs ? "column" : "row"}
          sx={{
            height: "100%",
            width: "100%",
            bgcolor: "background.default",
          }}
        >
          {!xs && <AppBar />}
          <Box sx={{ flex: 1, overflowX: "hidden" }}>
            <Router fallback={<NotFoundPage />} routes={routes} />
          </Box>
        </Stack>
        {xs && <BottomBar />}
      </Stack>
      <LostConnectionWarning />
    </>
  );
}

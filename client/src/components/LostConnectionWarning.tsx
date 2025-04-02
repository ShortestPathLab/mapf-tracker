import { Snackbar, Typography } from "@mui/material";
import { useBottomBar } from "App";
import { useHeartBeatQuery } from "queries/useHeartbeatQuery";
import usePortal from "react-useportal";
import { Dot } from "./Dot";
import useOffline from "use-offline/dist/hooks/use-offline";
import { useXs } from "./dialog/useSmallDisplay";

export function LostConnectionWarning() {
  const isOffline = useOffline();
  const { data, isLoading } = useHeartBeatQuery();
  const lostConnection = isOffline || (!isLoading && !data);
  const { Portal } = usePortal({ bindTo: document.body });
  const { enabled: bottomBar } = useBottomBar();
  const xs = useXs();
  return (
    <Portal>
      <Snackbar
        open={lostConnection}
        anchorOrigin={{ vertical: xs ? "bottom" : "top", horizontal: "center" }}
        ContentProps={{
          sx: {
            transition: (t) =>
              `${t.transitions.create([
                "translate",
                "opacity",
                "transform",
              ])} !important`,
            translate: bottomBar ? "0 -80px" : "0",
            color: "text.primary",
            bgcolor: "background.paper",
            justifyContent: "center",
          },
        }}
        message={
          <Typography variant="body2">
            <Dot sx={{ bgcolor: "warning.main" }} /> Offline
          </Typography>
        }
      />
    </Portal>
  );
}

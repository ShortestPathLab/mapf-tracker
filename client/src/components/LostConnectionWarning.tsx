import { Snackbar, Typography } from "@mui/material";
import { useBottomBar } from "App";
import { useHeartBeatQuery } from "queries/useHeartbeatQuery";
import usePortal from "react-useportal";
import { Dot } from "./Dot";
import useOffline from "use-offline/dist/hooks/use-offline";

export function LostConnectionWarning() {
  const isOffline = useOffline();
  const { data, isLoading } = useHeartBeatQuery();
  const lostConnection = isOffline || (!isLoading && !data);
  const { Portal } = usePortal({ bindTo: document.body });
  const { enabled: bottomBar } = useBottomBar();
  return (
    <Portal>
      <Snackbar
        open={lostConnection}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
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
            <Dot sx={{ bgcolor: "warning.main" }} /> Lost connection to the
            server, reconnecting...
          </Typography>
        }
      />
    </Portal>
  );
}

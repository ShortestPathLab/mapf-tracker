import { Snackbar, Typography } from "@mui/material";
import { useBottomBar } from "App";
import usePortal from "react-useportal";
import { Dot } from "./Dot";
import { useXs } from "./dialog/useSmallDisplay";
import { useConnectivity } from "../hooks/useConnectivity";

export function LostConnectionWarning() {
  const { disconnected } = useConnectivity();
  const { Portal } = usePortal({ bindTo: document.body });
  const { enabled: bottomBar } = useBottomBar();
  const xs = useXs();
  return (
    <Portal>
      <Snackbar
        open={disconnected}
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

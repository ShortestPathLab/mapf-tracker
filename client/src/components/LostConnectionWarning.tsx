import { Snackbar, Typography } from "@mui/material";
import { useBottomBar } from "App";
import usePortal from "react-useportal";
import { paper } from "theme";
import { useConnectivity } from "../hooks/useConnectivity";
import { Dot } from "./Dot";

export function LostConnectionWarning() {
  const { disconnected, offline } = useConnectivity();
  const { Portal } = usePortal({ bindTo: document.body });
  const { enabled: bottomBar } = useBottomBar();
  return (
    <Portal>
      {[
        {
          value: disconnected && !offline,
          label: "Connection lost",
          color: "warning.main",
        },
        { value: offline, label: "Offline", color: "text.secondary" },
      ].map(
        ({ value, label, color }) =>
          value && (
            <Snackbar
              key={label}
              open={disconnected}
              anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
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
                  ...paper(0),
                },
              }}
              message={
                <Typography variant="body2">
                  <Dot sx={{ bgcolor: color }} /> {label}
                </Typography>
              }
            />
          )
      )}
    </Portal>
  );
}

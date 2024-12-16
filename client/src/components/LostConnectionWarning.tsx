import { Backdrop, Snackbar, Typography } from "@mui/material";
import { useHeartBeatQuery } from "queries/useHeartbeatQuery";
import usePortal from "react-useportal";

export function LostConnectionWarning() {
  const { data, isLoading } = useHeartBeatQuery();
  const lostConnection = !isLoading && !data;
  const { Portal } = usePortal({ bindTo: document.body });
  return (
    <Portal>
      <Backdrop open={lostConnection} sx={{ zIndex: Number.MAX_SAFE_INTEGER }}>
        <Snackbar
          open={lostConnection}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          sx={{}}
          ContentProps={{
            sx: {
              bgcolor: "warning.main",
              color: "warning.contrastText",
              justifyContent: "center",
            },
          }}
          message={
            <Typography variant="body2">
              Lost connection to the server, reconnecting...
            </Typography>
          }
        />
      </Backdrop>
    </Portal>
  );
}

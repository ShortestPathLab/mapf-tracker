import { Backdrop, Snackbar, Typography } from "@mui/material";
import { useHeartBeatQuery } from "queries/useHeartbeatQuery";

export function LostConnectionWarning() {
  const { data, isLoading } = useHeartBeatQuery();
  const lostConnection = !isLoading && !data;
  return (
    <Backdrop open={lostConnection} sx={{ zIndex: Number.MAX_SAFE_INTEGER }}>
      <Snackbar
        open={lostConnection}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
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
  );
}

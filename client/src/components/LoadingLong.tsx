import { Box, CircularProgress, Fade, Stack, Typography, useTheme } from "@mui/material";
import { ReactElement, cloneElement } from "react";
import { useCss, useTimeout } from "react-use";
import { ResponsiveContainer, ResponsiveContainerProps } from "recharts";
import { fontFamily } from "theme";

export function Loading() {
  "use no memo";
  const [ready] = useTimeout(4500);
  return (
    <Stack
      sx={{
        gap: 4,
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
      }}
    >
      <CircularProgress />
      {ready() && (
        <Typography color="text.secondary" variant="body2">
          Generating data for the first time (this may take a while)
        </Typography>
      )}
    </Stack>
  );
}

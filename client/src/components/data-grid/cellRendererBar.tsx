import { LinearProgress, Stack, Tooltip, Typography } from "@mui/material";
import { round } from "lodash";

export const cellRendererBar = ({ value }: { value?: number }) => (
  <Tooltip title={`${round(value * 100, 4)}%`}>
    <Stack
      direction="row"
      sx={{
        width: "100%",
        alignItems: "center",
        gap: 1,
      }}
    >
      <LinearProgress
        sx={{ flex: 1 }}
        color={value === 1 ? "success" : undefined}
        value={value * 100}
        variant="determinate"
      />
      <Typography variant="overline" sx={{ width: 32, textAlign: "right" }}>
        {`${round(value * 100)}%`}
      </Typography>
    </Stack>
  </Tooltip>
);

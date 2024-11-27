import { LinearProgress, Stack, Tooltip, Typography } from "@mui/material";
import { round, floor, find, map, sumBy, head } from "lodash";

const formatValue = (v: number) =>
  v ? (v < 0.01 ? "<1%" : `${floor(v * 100)}%`) : "0%";

export const cellRendererBar = ({
  value,
  valueBuffer = 0,
  buffer,
}: {
  value?: number;
  valueBuffer?: number;
  buffer?: boolean;
}) => (
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
        valueBuffer={valueBuffer * 100}
        variant={buffer ? "buffer" : "determinate"}
      />
      <Typography variant="overline" sx={{ width: 32, textAlign: "right" }}>
        {formatValue(value)}
      </Typography>
    </Stack>
  </Tooltip>
);

const easeCircle = "cubic-bezier(0.16, 1, 0.3, 1)";

export const Bar = ({
  values,
  buffer,
}: {
  values?: { color: string; value: number; label: string; primary?: boolean }[];
  buffer?: boolean;
}) => {
  const primary = find(values, "primary") ?? head(values);
  const slack = 1 - sumBy(values, "value");
  return (
    <Stack
      direction="row"
      sx={{
        width: "100%",
        alignItems: "center",
        gap: 1,
      }}
    >
      <Stack direction="row" sx={{ flex: 1 }}>
        {map(values, ({ value, color, label }) => (
          <Tooltip title={`${label}: ${round(value * 100, 4)}%`}>
            <LinearProgress
              sx={{
                transition: `flex 0.3s ${easeCircle}`,
                flex: value,
                "> .MuiLinearProgress-bar": { bgcolor: color },
              }}
              value={100}
              variant="determinate"
            />
          </Tooltip>
        ))}
        {slack > 0 && (
          <LinearProgress
            sx={{ flex: slack, transition: `flex 0.3s ${easeCircle}` }}
            value={0}
            variant={buffer ? "buffer" : "determinate"}
          />
        )}
      </Stack>
      <Typography variant="overline" sx={{ width: 32, textAlign: "right" }}>
        {formatValue(primary?.value)}
      </Typography>
    </Stack>
  );
};

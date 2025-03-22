import {
  alpha,
  Chip,
  LinearProgress,
  Stack,
  StackProps,
  Theme,
  Tooltip,
  Typography,
} from "@mui/material";
import { find, floor, head, map, merge, round, sumBy } from "lodash";
import { ReactNode } from "react";

export const formatValue = (v: number) =>
  v ? (v < 0.01 ? "<1%" : `${floor(v * 100)}%`) : "0%";

export const cellRendererText = ({
  formattedValue,
}: {
  formattedValue?: ReactNode;
}) => (
  <Typography
    variant="body2"
    sx={{
      overflow: "hidden",
      textOverflow: "ellipsis",
    }}
    color={formattedValue ? "text.primary" : "text.secondary"}
  >
    {formattedValue ?? "--"}
  </Typography>
);
export const cellRendererCode = ({
  formattedValue,
}: {
  formattedValue?: ReactNode;
}) => (
  <Typography
    variant="body2"
    sx={{
      overflow: "hidden",
      textOverflow: "ellipsis",
    }}
    color={formattedValue ? "text.primary" : "text.secondary"}
  >
    <code>{formattedValue ?? "--"}</code>
  </Typography>
);

export const cellRendererChip = ({
  formattedValue,
}: {
  formattedValue?: ReactNode;
}) => <Chip label={formattedValue} size="small" />;

export const cellRendererBar = ({
  value,
  valueBuffer = 0,
  buffer,
  label,
  labelWidth = 32,
}: {
  value?: number;
  valueBuffer?: number;
  buffer?: boolean;
  label?: ReactNode;
  labelWidth?: number;
}) => (
  <Tooltip title={label ?? `${round(value * 100, 4)}%`}>
    <Stack
      direction="row"
      sx={{
        width: "100%",
        alignItems: "center",
        gap: 1,
      }}
    >
      <Bar
        sx={{ flex: 1 }}
        buffer={buffer}
        values={[
          {
            value,
            color: value === 1 ? "success.main" : "info.main",
            primary: true,
            label,
          },
          {
            value: valueBuffer,
            label: "...",
            color: (t) => alpha(t.palette.primary.main, 0.5),
          },
        ]}
      />
      <Typography
        variant="overline"
        sx={{ width: labelWidth, textAlign: "right" }}
      >
        {label ?? formatValue(value)}
      </Typography>
    </Stack>
  </Tooltip>
);

const easeCircle = "cubic-bezier(0.16, 1, 0.3, 1)";

export const Bar = ({
  values,
  buffer,
  label,
  renderLabel = (l, v) => `${l}: ${formatValue(v)}`,
  ...props
}: {
  renderLabel?: (label: string, value: number) => ReactNode;
  values?: {
    color: string | ((t: Theme) => string);
    value: number;
    label: ReactNode;
    primary?: boolean;
  }[];
  buffer?: boolean;
  label?: ReactNode;
} & StackProps) => {
  const primary = find(values, "primary") ?? head(values);
  const slack = 1 - sumBy(values, "value");
  return (
    <Stack
      {...merge(
        {
          direction: "row",
          sx: {
            width: "100%",
            alignItems: "center",
            gap: 1,
          },
        },
        props
      )}
    >
      <Stack direction="row" sx={{ flex: 1 }}>
        {map(values, ({ value, color, label }) => (
          <Tooltip
            title={
              typeof label === "string" ? renderLabel(label, value) : label
            }
          >
            <LinearProgress
              sx={{
                bgcolor: "transparent",
                transition: `flex 2s ${easeCircle}`,
                flex: value,
                "> .MuiLinearProgress-bar": { bgcolor: color ?? "info.main" },
              }}
              value={100}
              variant="determinate"
            />
          </Tooltip>
        ))}
        {slack > 0 && (
          <LinearProgress
            sx={{
              flex: slack,
              bgcolor: "action.disabledBackground",
              transition: `flex 2s ${easeCircle}`,
            }}
            value={0}
            valueBuffer={0}
            variant={buffer ? "buffer" : "determinate"}
          />
        )}
      </Stack>
      {label && (
        <Typography
          variant="overline"
          sx={{
            width: 32,
            textAlign: "right",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          {formatValue(primary?.value)}
        </Typography>
      )}
    </Stack>
  );
};

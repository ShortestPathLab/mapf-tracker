import { Box, Stack, StackProps } from "@mui/material";
import { Item } from "components/Item";
import { ReactNode } from "react";
import Size from "react-virtualized-auto-sizer";
import { paper } from "theme";

function ChartCard({
  label,
  extras,
  primary,
  ...props
}: {
  label?: ReactNode;
  extras?: ReactNode;
  primary?: ReactNode;
} & StackProps) {
  return (
    <Stack {...props} sx={{ ...paper(0), p: 2, gap: 2, ...props.sx }}>
      <Stack direction="row" sx={{ justifyContent: "space-between" }}>
        {label}
        {extras}
      </Stack>
      <Box sx={{ flex: 1 }}>
        <Size>
          {({ width, height }) => (
            <Stack sx={{ width, height }}>{primary}</Stack>
          )}
        </Size>
      </Box>
    </Stack>
  );
}
export const GridChartCard = ({
  columns,
  height,
  primaryLabel,
  secondaryLabel,
  extras,
  content,
}: {
  columns?: number;
  height?: number;
  primaryLabel?: string;
  secondaryLabel?: string;
  extras?: ReactNode;
  content?: ReactNode;
}) => (
  <ChartCard
    sx={{ gridColumn: `span ${columns}`, height }}
    label={
      <Item disableMargin primary={primaryLabel} secondary={secondaryLabel} />
    }
    extras={extras}
    primary={content}
  />
);

import { Stack, Typography, alpha, useTheme } from "@mui/material";
import { Bar } from "components/data-grid";
import { format, parse } from "date-fns";
import { head, last, map, max, sum } from "lodash";
import { useSeries } from "queries/useSeriesQuery";
import { ComponentProps } from "react";
import { GridChartCard } from "./GridChartCard";

const formatDate = (s?: string) =>
  s ? format(parse(s, "yyyy-MM", new Date()), "MMM yyyy") : "";

export function RecentActivityChart(
  props: ComponentProps<typeof GridChartCard>
) {
  const theme = useTheme();
  const { data } = useSeries("solution_algos", 36);
  const peak = max(map(data, "count"));
  const total = sum(map(data, "count"));
  return (
    <GridChartCard
      primaryLabel="Activity"
      secondaryLabel={`${total} solved in the past 3 years`}
      {...props}
      content={
        <Stack sx={{ gap: 1 }}>
          <Stack direction="row" sx={{ justifyContent: "space-between" }}>
            {[head(data), last(data)].map((item, i) => (
              <Typography
                key={i}
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: "0.75rem", minWidth: "max-content" }}
              >
                {formatDate(item?._id)}
              </Typography>
            ))}
          </Stack>
          <Bar
            sx={{
              "> div": {
                gap: "1%",
                "> *": {
                  borderRadius: 0.5,
                  height: 48,
                },
              },
            }}
            label={null}
            renderLabel={(label) => label}
            values={map(data, ({ _id, count }) => ({
              value: 1 / data.length,
              color: alpha(
                theme.palette.primary.main,
                max([0.1, count / peak])
              ),
              label: `${formatDate(_id)}: ${count} solved`,
            }))}
          />
        </Stack>
      }
    />
  );
}

import { alpha, useTheme } from "@mui/material";
import { useQueries } from "@tanstack/react-query";
import { Bar } from "components/data-grid";
import { aggregateQueryOne } from "queries/useAggregateQuery";
import { ComponentProps } from "react";
import { GridChartCard } from "./GridChartCard";

export function TotalSolvedClosedChart(
  props: ComponentProps<typeof GridChartCard>
) {
  const theme = useTheme();
  const [
    { data: { result: closed = 0 } = {} },
    { data: { result: solved = 0, all: total = 1 } = {} },
  ] = useQueries({
    queries: [
      aggregateQueryOne({ filterBy: "closed" }),
      aggregateQueryOne({ filterBy: "solved" }),
    ],
  });
  return (
    <GridChartCard
      primaryLabel="Total completion"
      secondaryLabel={`${solved} solved, ${closed} closed, of ${total}`}
      {...props}
      content={
        <Bar
          sx={{ height: "100%" }}
          values={[
            { label: "Closed", value: closed / total, color: "success.main" },
            {
              label: "Solved but not closed",
              value: (solved - closed) / total,
              color: alpha(theme.palette.success.main, 0.5),
            },
          ]}
        />
      }
    />
  );
}

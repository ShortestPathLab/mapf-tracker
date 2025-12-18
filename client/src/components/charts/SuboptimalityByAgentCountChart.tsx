import { useTheme } from "@mui/material";
import { useQueries } from "@tanstack/react-query";
import { Chart } from "components/analysis/Chart";
import { aggregateQuery } from "queries/useAggregateQuery";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Label,
  Legend,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { paper } from "theme";
import { formatPercentage } from "utils/format";
import _, { max, range } from "lodash";
import { accentColors, colors, tone } from "utils/colors";

export function SuboptimalityByAgentCountChart({ map }: { map?: string }) {
  const { palette } = useTheme();

  const results = useQueries({
    queries: [
      aggregateQuery({
        groupBy: "agents",
        operation: "min",
        value: "suboptimality",
        filterBy: "solved", // Only solved instances have solution cost
        map,
      }),
      aggregateQuery({
        groupBy: "agents",
        operation: "max",
        value: "suboptimality",
        filterBy: "solved",
        map,
      }),
    ],
    combine: (results) => {
      const [minQuery, maxQuery] = results;

      const minData = _.keyBy(minQuery.data, "_id");
      const maxData = _.keyBy(maxQuery.data, "_id");
      const agents = max([
        minQuery.data?.length ?? 0,
        maxQuery.data?.length ?? 0,
      ]);

      return {
        isLoading: minQuery.isLoading || maxQuery.isLoading,
        data: range(agents).map((agent) => ({
          agentCount: agent,
          range: [
            minData[agent]?.result ?? 1, // default to 1 if missing
            maxData[agent]?.result ?? 1,
          ],
        })),
      };
    },
  });
  return (
    <Chart
      isLoading={results.isLoading}
      data={results.data}
      render={
        <AreaChart margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
          <CartesianGrid stroke={palette.divider} />
          <XAxis
            dataKey="agentCount"
            type="number"
            label={
              <Label position="insideBottom" value="Agent Count" offset={-10} />
            }
          />
          <YAxis
            type="number"
            domain={[1, "auto"]}
            tickFormatter={(v) => `x${v.toFixed(1)}`}
            label={
              <Label
                position="insideLeft"
                value="Suboptimality"
                angle={-90}
                style={{ textAnchor: "middle" }}
              />
            }
          />
          <Tooltip
            contentStyle={{ border: paper(0).border({ palette } as any) }}
            formatter={(value: any) => {
              if (Array.isArray(value)) {
                return [
                  `${value[0].toFixed(2)} - ${value[1].toFixed(2)}`,
                  "Range",
                ];
              }
              return value;
            }}
          />
          <Legend verticalAlign="top" height={36} />
          <Area
            type="monotone"
            dataKey="range"
            stroke={tone(palette.mode, accentColors.lightBlue)}
            fill={tone(palette.mode, accentColors.lightBlue)}
            fillOpacity={0.3}
            name="Suboptimality Range"
          />
        </AreaChart>
      }
    />
  );
}

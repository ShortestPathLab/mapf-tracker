import { useTheme } from "@mui/material";
import { useQueries } from "@tanstack/react-query";
import { Chart } from "components/analysis/Chart";
import { aggregateQuery, algorithmQuery } from "queries/useAggregateQuery";
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
import { formatPercentage, formatScientific } from "utils/format";
import _, { isNil, max, range, round } from "lodash";
import { accentColors, colors, tone } from "utils/colors";
import { sample } from "./sample";

export function SuboptimalityByAgentCountChart({
  map,
  algorithm,
}: {
  map?: string;
  algorithm?: string;
}) {
  const { palette } = useTheme();

  const queryFn = algorithm ? algorithmQuery : aggregateQuery;
  const commonParams = {
    groupBy: "agents" as const,
    value: "suboptimality" as const,
    filterBy: "solved" as const,
    map,
    algorithm,
  };

  const results = useQueries({
    queries: [
      queryFn({
        ...commonParams,
        operation: "min",
      }),
      queryFn({
        ...commonParams,
        operation: "max",
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
        data: range(agents).flatMap((agent) => {
          if (
            !isNil(minData[agent]?.result) &&
            !isNil(maxData[agent]?.result)
          ) {
            return [
              {
                agentCount: agent,
                range: [minData[agent]?.result, maxData[agent]?.result],
              },
            ];
          }
          return [];
        }),
      };
    },
  });

  const formatValue = (v: number) =>
    `${Math.abs(v) <= 10 ? round(v * 100, 1) : formatScientific(v * 100)}%`;

  return (
    <Chart
      isLoading={results.isLoading}
      data={sample(500)(results.data)}
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
            width={80}
            domain={[0, "auto"]}
            tickFormatter={(v) => `${formatValue(v)}`}
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
                  `${formatValue(value[0])} - ${formatValue(value[1])}`,
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

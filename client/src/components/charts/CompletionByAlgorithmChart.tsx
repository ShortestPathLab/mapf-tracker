import { Box, useTheme } from "@mui/material";
import { Chart } from "components/analysis/Chart";
import { Slice } from "components/analysis/useAlgorithmSelector";
import { Scroll } from "components/dialog/Scrollbars";
import { useNavigate } from "hooks/useNavigation";
import { chain as _, find, get, map, max, round, sortBy, zip } from "lodash";
import { useAggregateAlgorithm } from "queries/useAggregateQuery";
import { useAlgorithmsData } from "queries/useAlgorithmQuery";
import { ComponentProps, useMemo } from "react";
import { useSize } from "react-use";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Label,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { paper } from "theme";
import { toneBy } from "utils/colors";
import { GridChartCard } from "./GridChartCard";

export const slices = [
  {
    key: "count",
    name: "Count",
  },
] satisfies Slice[];

const defaultSeries = [
  {
    opacity: 1,
    key: "solved",
    name: "Solved",
  },
  {
    opacity: 0.5,
    key: "closed",
    name: "Closed",
  },
];

export function CategoryChart({
  data,
  showLabels,
  series = defaultSeries,
  ...props
}: {
  showLabels?: boolean;
  series?: {
    opacity: number;
    key: string;
    name: string;
  }[];
  data?: { closed: number; solved: number; _id: string; i: number }[];
} & ComponentProps<typeof BarChart>) {
  const [box, { width }] = useSize(() => <div style={{ width: "100%" }} />);
  const theme = useTheme();
  const sm = width < 480;
  const peak = max(map(data, (c) => max(map(series, (s) => get(c, s.key)))));

  return (
    <>
      <BarChart
        data={data}
        margin={{ bottom: 20 }}
        layout="vertical"
        barGap={4}
        {...props}
      >
        <Tooltip
          formatter={(v, _, item) => (
            <Box
              component="span"
              sx={{
                color: toneBy(theme.palette.mode, item.payload.i, 3, 8),
              }}
            >
              {v}
            </Box>
          )}
          contentStyle={{ border: paper(0).border(theme) }}
          cursor={{ fill: theme.palette.action.disabledBackground }}
        />
        <XAxis
          type="number"
          domain={[0, peak * (sm ? 2 : 1.5)]}
          tickFormatter={formatLargeNumber}
          label={<Label value="Count" position={"bottom"} />}
          width={50}
        />
        <YAxis
          type="category"
          tick={{ fill: theme.palette.text.secondary }}
          dataKey="label"
          width={180}
          {...(sm && {
            orientation: "right",
            mirror: true,
          })}
        />
        <CartesianGrid stroke={theme.palette.divider} />
        {map(series, ({ key, opacity, name }) => (
          <Bar
            radius={[4, 4, 4, 4]}
            type="monotone"
            isAnimationActive={false}
            dataKey={key}
            name={name}
            opacity={1}
            fill={theme.palette.text.secondary}
            fillOpacity={0}
            label={
              showLabels && {
                position: "right",
                fill: theme.palette.text.secondary,
                fontSize: 12,
                width: 1000,
                formatter: (v: number) => `${name}: ${formatLargeNumber(v)}`,
              }
            }
          >
            {data.map((entry, i) => (
              <Cell
                key={`${entry?._id}-${i}`}
                fill={toneBy(theme.palette.mode, i, 3, 8)}
                fillOpacity={opacity}
              />
            ))}
          </Bar>
        ))}
      </BarChart>
      {box}
    </>
  );
}

export function formatScientific(n: number) {
  return n > 9
    ? n.toLocaleString("fullwide", { notation: "scientific" })
    : `${n}`;
}

export function formatLargeNumber(n: number) {
  return n > 999 ? `${round(n / 1000, 1)?.toLocaleString?.()}k` : `${n}`;
}

function CompletionByAlgorithmChart() {
  const navigate = useNavigate();
  const { data: solved, isLoading: isSolvedLoading } = useAggregateAlgorithm({
    groupBy: "algorithm",
    filterBy: "solved",
  });
  const { data: closed, isLoading: isClosedLoading } = useAggregateAlgorithm({
    groupBy: "algorithm",
    filterBy: "closed",
  });
  const { data: algorithms, isLoading: isAlgorithmsLoading } =
    useAlgorithmsData();

  const { data } = useMemo(() => {
    const data = _(zip(sortBy(closed, "_id"), sortBy(solved, "_id")))
      .map(([c, s], i) => ({
        i,
        _id: c?._id,
        label: find(algorithms, { _id: c?._id })?.algo_name,
        all: c?.all,
        solved: s?.result,
        closed: c?.result,
      }))
      .orderBy(["solved"], ["desc"])
      .value();
    return {
      data,
    };
  }, [closed, solved, algorithms]);
  return (
    <Scroll y>
      <Box
        sx={{
          height: data.length * 64,
          "& g.recharts-bar": {
            cursor: "pointer",
          },
        }}
      >
        <Chart
          isLoading={isSolvedLoading || isClosedLoading || isAlgorithmsLoading}
          style={{ flex: 1 }}
          data={data}
          render={
            <CategoryChart
              showLabels
              onClick={(e) => {
                const id = e.activePayload?.[0]?.payload?._id;
                if (id) navigate(`/submissions/${id}`);
              }}
            />
          }
        />
      </Box>
    </Scroll>
  );
}

export function CompletionByAlgorithmChartCard(
  props: ComponentProps<typeof GridChartCard>
) {
  return <GridChartCard {...props} content={<CompletionByAlgorithmChart />} />;
}

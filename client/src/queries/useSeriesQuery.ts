import { useQuery } from "@tanstack/react-query";
import { format, sub } from "date-fns";
import { find, now, range } from "lodash";
import api, { DataOf, unwrap } from "hooks/useQuery";

/** A `{ _id: "YYYY-MM", count }` monthly bucket, inferred from the server. */
export type Result = DataOf<ReturnType<typeof api.api.queries.series.instances>["get"]>[number];

export type Trend = "lower_algos" | "solution_algos";

async function series(trend: Trend, months: number) {
  const result = await unwrap(api.api.queries.series.instances({ series: trend }).get());
  return range(0, months)
    .map((i) => format(sub(now(), { months: i }), "yyyy-MM"))
    .map((s) => find(result, { _id: s }) ?? { _id: s, count: 0 })
    .reverse();
}

export function useSeries(trend: Trend, months: number = 24) {
  return useQuery({
    queryKey: ["aggregate/series", trend, months],
    queryFn: () => series(trend, months),
  });
}

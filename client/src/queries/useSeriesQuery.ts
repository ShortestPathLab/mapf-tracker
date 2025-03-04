import { useQuery } from "@tanstack/react-query";
import { APIConfig } from "core/config";
import { format, sub } from "date-fns";
import { find, now, range } from "lodash";
import { json } from "./query";

export type Result = {
  /**
   * YYYY-MM
   */
  _id: string;
  count: number;
};

export type Trend = "lower_algos" | "solution_algos";

async function series(trend: Trend, months: number) {
  const result = await json<Result[]>(
    `${APIConfig.apiUrl}/queries/series/instances/${trend}`
  );
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

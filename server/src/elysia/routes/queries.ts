import {
  isClosedCond,
  isSolvedCond,
} from "aggregations/stages/updateScenariosFromInstances";
import { Elysia, type Context } from "elysia";
import { isUndefined, omitBy } from "lodash";
import { Instance, algorithms, instances, submissions } from "models";
import { AggregateBuilder, dateToString } from "mongodb-aggregate-builder";
import { Types } from "mongoose";
import { z } from "zod";
import { operations } from "../../query/aggregate";

const metrics = ["instances_closed", "instances_solved"] as const;

const series = ["lower_algos", "solution_algos"] as const;

/** Monthly bucket count for the `/series/instances/:series` trend. */
type SeriesResult = { _id: string; count: number };

/**
 * A grouped aggregate row. `_id` is the group key — a serialised ObjectId or a
 * type/agents value (or null for the ungrouped total). `all`/`result` are the
 * aggregated metric over all rows and over the filtered subset respectively.
 */
type AggregateResult = {
  _id: string | number | null;
  all: number;
  result: number;
};

/** A projected `{ algo_name, <metric> }` row for `/algorithms/:metric`. */
type AlgorithmMetricResult = {
  _id: string;
  algo_name: string;
} & Partial<Record<(typeof metrics)[number], number>>;

const aggregateOptions = {
  value: z
    .enum(["solution_cost", "lower_cost", "suboptimality"])
    .default("solution_cost"),
  operation: z.enum(["count", "sum", "max", "min", "avg"]).default("count"),
  map: z.string().optional(),
  scenario: z.string().optional(),
  scenarioType: z.string().optional(),
  agents: z.coerce.number().int().nonnegative().optional(),
  filterBy: z.enum(["closed", "solved", "has_lower", "all"]).default("all"),
  groupBy: z
    .enum(["scenario", "map", "agents", "scenarioType", "mapType", "all"])
    .default("all"),
};

type BaseAggregateOptions = z.infer<z.ZodObject<typeof aggregateOptions>>;

type AggregateOptions<
  Filters extends string = never,
  Groups extends string = never,
> = Omit<BaseAggregateOptions, "filterBy" | "groupBy"> & {
  filterBy: BaseAggregateOptions["filterBy"] | Filters;
  groupBy: BaseAggregateOptions["groupBy"] | Groups;
};

const createAggregateBase =
  <
    Filters extends string = never,
    Groups extends string = never,
    U extends AggregateOptions<Filters, Groups> = AggregateOptions<
      Filters,
      Groups
    >,
  >(
    filters: Record<U["filterBy"], (a: string, b: string) => any>,
    groupBySelectors: Record<U["groupBy"], string | null>,
  ) =>
  (
    { map, scenario, agents, groupBy, operation: o, value: v, filterBy: f }: U,
    p: AggregateBuilder = new AggregateBuilder(),
  ) =>
    p
      .match(
        omitBy(
          {
            map_id: map ? new Types.ObjectId(map) : undefined,
            scen_id: scenario ? new Types.ObjectId(scenario) : undefined,
            agents,
          },
          isUndefined,
        ),
      )
      .group({
        _id: groupBySelectors[groupBy],
        all: operations[o](undefined, v === "suboptimality" ? 1 : `$${v}`),
        result: operations[o](
          filters[f]("$solution_cost", "$lower_cost"),
          v === "suboptimality"
            ? {
                $divide: [
                  { $subtract: ["$solution_cost", "$lower_cost"] },
                  { $max: ["$lower_cost", 1] },
                ],
              }
            : `$${v}`,
        ),
      });

// Inputs that were validated by zod over {...params, ...query} now do the same
// inside each handler so defaults/coercion are preserved. Cache keys include
// the query string for the option-driven aggregates.
const withParamsAndQuery = (ctx: Context) => ({ ...ctx.params, ...ctx.query });

const instanceAggregateBase = createAggregateBase(
  {
    solved: isSolvedCond,
    closed: isClosedCond,
    has_lower: (_s, lower) => ({ $ne: [lower, null] }),
    all: () => undefined,
  },
  {
    mapType: "$map_type",
    scenarioType: "$scenario_type",
    scenario: "$scen_id",
    map: "$map_id",
    agents: "$agents",
    all: null,
  },
);

export const queriesRoutes = new Elysia({ prefix: "/api/queries" })
  .get(
    "/algorithms/:metric",
    algorithms.aggregate<AlgorithmMetricResult[]>(
      (ctx, p) => {
        const { metric } = z.object({ metric: z.enum(metrics) }).parse(ctx.params);
        return p.project({ algo_name: 1, [metric]: 1 });
      },
      { name: "algorithms-metric" },
    ),
  )
  .get(
    "/series/instances/:series",
    instances.aggregate<SeriesResult[]>(
      (ctx, p) => {
        const { series: s } = z
          .object({ series: z.enum(series) })
          .parse(ctx.params);
        return p
          .match({ solution_date: { $ne: null } })
          .group({
            _id: {
              $cond: {
                if: { $eq: [{ $type: "$solution_date" }, "string"] },
                then: { $substr: ["$solution_date", 0, 7] },
                else: dateToString("$solution_date", "%Y-%m"),
              },
            },
            count: { $count: {} },
          })
          .sort({ _id: 1 });
      },
      { name: "series-instances-series" },
    ),
  )
  .get(
    "/aggregate",
    instances.aggregate<AggregateResult[]>(
      (ctx, p) => {
        const data = z.object(aggregateOptions).parse(withParamsAndQuery(ctx));
        return instanceAggregateBase(data, p);
      },
      { name: "aggregate", cacheKey: withParamsAndQuery },
    ),
  )
  .get(
    "/aggregate/algorithm/:algorithm",
    submissions.aggregate<AggregateResult[]>(submissionAggregate, {
      name: "aggregate-algorithm-algorithm",
      cacheKey: withParamsAndQuery,
    }),
  )
  .get(
    "/aggregate/algorithm",
    submissions.aggregate<AggregateResult[]>(submissionAggregate, {
      name: "aggregate-algorithm-algorithm",
      cacheKey: withParamsAndQuery,
    }),
  );

function submissionAggregate(ctx: Context, p: AggregateBuilder) {
  const { algorithm, ...rest } = z
    .object({
      ...aggregateOptions,
      algorithm: z.string().optional(),
      filterBy: aggregateOptions.filterBy.or(
        z.enum(["best_lower", "best_solution"]),
      ),
      groupBy: aggregateOptions.groupBy.or(z.enum(["algorithm"])),
    })
    .parse(withParamsAndQuery(ctx));
  return p
    .match(
      omitBy(
        {
          algo_id: algorithm ? new Types.ObjectId(algorithm) : undefined,
        },
        isUndefined,
      ),
    )
    .mergeAggregationWithCurrent(
      rest.value === "suboptimality"
        ? [
            new AggregateBuilder()
              .lookup(
                Instance.collection.collectionName,
                "instance_id",
                "_id",
                "instance",
              )
              .addFields({
                lower_cost: { $first: "$instance.lower_cost" },
              })
              .project({
                instance: 0,
              })
              .build(),
          ]
        : [],
    )
    .mergeAggregationWithCurrent([
      createAggregateBase<typeof rest.filterBy, typeof rest.groupBy>(
        {
          solved: isSolvedCond,
          closed: isClosedCond,
          has_lower: (_s, lower) => ({ $ne: [lower, null] }),
          best_lower: () => ({ $eq: ["$best_lower", true] }),
          best_solution: () => ({ $eq: ["$best_solution", true] }),
          all: () => undefined,
        },
        {
          mapType: "$map_type",
          scenarioType: "$scenario_type",
          scenario: "$scen_id",
          map: "$map_id",
          agents: "$agents",
          algorithm: "$algo_id",
          all: null,
        },
      )(rest).build(),
    ]);
}

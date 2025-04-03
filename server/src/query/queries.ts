import {
  isClosedCond,
  isSolvedCond,
} from "aggregations/stages/updateScenariosFromInstances";
import { Application, Router } from "express";
import { isUndefined, omitBy } from "lodash";
import {
  Instance,
  Map,
  Scenario,
  algorithms,
  instances,
  submissions,
} from "models";
import { AggregateBuilder, dateToString } from "mongodb-aggregate-builder";
import { Types } from "mongoose";
import { z } from "zod";
import { operations } from "./aggregate";

const metrics = ["instances_closed", "instances_solved"] as const;

const series = ["lower_algos", "solution_algos"] as const;

const aggregateOptions = {
  //
  // ─── Select ──────────────────────────────────────────────────────────

  value: z.enum(["solution_cost", "lower_cost"]).default("solution_cost"),

  // ─── Aggregate ───────────────────────────────────────────────────────

  operation: z.enum(["count", "sum", "max", "min", "avg"]).default("count"),

  // ─── Where ───────────────────────────────────────────────────────────

  // Map id, undefined assumed to be all
  map: z.string().optional(),
  // Scenario id, undefined assumed to be all
  scenario: z.string().optional(),
  // Scenario id, undefined assumed to be all
  scenarioType: z.string().optional(),
  // Agent count, undefined assumed to be all
  agents: z.number().int().nonnegative().optional(),

  // ─── Filter ──────────────────────────────────────────────────────────

  filterBy: z.enum(["closed", "solved", "all"]).default("all"),

  // ─── Group By ────────────────────────────────────────────────────────

  groupBy: z
    .enum(["scenario", "map", "agents", "scenarioType", "mapType", "all"])
    .default("all"),
  //
};

type BaseAggregateOptions = z.infer<z.ZodObject<typeof aggregateOptions>>;

type AggregateOptions<
  Filters extends string = never,
  Groups extends string = never
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
    >
  >(
    filters: Record<U["filterBy"], (a: string, b: string) => any>,
    groupBySelectors: Record<U["groupBy"], string | null>
  ) =>
  (
    {
      map,
      scenario,
      agents,
      scenarioType,
      groupBy,
      operation: o,
      value: v,
      filterBy: f,
    }: U,
    p: AggregateBuilder = new AggregateBuilder()
  ) =>
    p
      .mergeAggregationWithCurrent([
        scenarioType
          ? new AggregateBuilder()
              .lookup(
                Scenario.collection.collectionName,
                "scen_id",
                "_id",
                "scenario"
              )
              .match({ "scenarios.scen_type": scenarioType })
              .project({ scenarios: 0 })
              .build()
          : [],
      ])
      .match(
        omitBy(
          {
            map_id: map ? new Types.ObjectId(map) : undefined,
            scen_id: scenario ? new Types.ObjectId(scenario) : undefined,
            agents,
          },
          isUndefined
        )
      )
      .mergeAggregationWithCurrent([
        groupBy === "scenarioType"
          ? new AggregateBuilder()
              .lookup(
                Scenario.collection.collectionName,
                "scen_id",
                "_id",
                "scenario"
              )
              .addFields({ scenario: { $first: "$scenario" } })
              .build()
          : groupBy === "mapType"
          ? new AggregateBuilder()
              .lookup(Map.collection.collectionName, "map_id", "_id", "map")
              .addFields({ map: { $first: "$map" } })
              .build()
          : [],
      ])
      .group({
        _id: groupBySelectors[groupBy],
        all: operations[o](undefined, `$${v}`),
        result: operations[o](
          filters[f]("$solution_cost", "$lower_cost"),
          `$${v}`
        ),
      });

export const use = (app: Application, path: string = "/api/queries") => {
  app.use(
    path,
    Router()
      .get(
        "/algorithms/:metric",
        algorithms.aggregate(
          z.object({ metric: z.enum(metrics) }),
          ({ metric }, p) => p.project({ algo_name: 1, [metric]: 1 })
        )
      )
      .get(
        "/series/instances/:series",
        instances.aggregate(
          z.object({ series: z.enum(series) }),
          ({ series }, p) =>
            p
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
              .sort({ _id: 1 })
        )
      )
      .get(
        "/aggregate",
        instances.aggregate(
          z.object(aggregateOptions),
          createAggregateBase(
            {
              solved: isSolvedCond,
              closed: isClosedCond,
              all: () => undefined,
            },
            {
              mapType: "$map.map_type",
              scenarioType: "$scenario.scen_type",
              scenario: "$scen_id",
              map: "$map_id",
              agents: "$agents",
              all: null,
            }
          )
        )
      )
      .get(
        "/aggregate/algorithm/:algorithm?",
        submissions.aggregate(
          z.object({
            ...aggregateOptions,
            algorithm: z.string().optional(),
            filterBy: aggregateOptions.filterBy.or(
              z.enum(["best_lower", "best_solution"])
            ),
            groupBy: aggregateOptions.groupBy.or(z.enum(["algorithm"])),
          }),
          ({ algorithm, ...rest }, p) =>
            p
              .match(
                omitBy(
                  {
                    algo_id: algorithm
                      ? new Types.ObjectId(algorithm)
                      : undefined,
                  },
                  isUndefined
                )
              )
              .mergeAggregationWithCurrent([
                createAggregateBase<typeof rest.filterBy, typeof rest.groupBy>(
                  {
                    solved: isSolvedCond,
                    closed: isClosedCond,
                    best_lower: () => ({
                      $eq: ["$best_lower", true],
                    }),
                    best_solution: () => ({
                      $eq: ["$best_solution", true],
                    }),
                    all: () => undefined,
                  },
                  {
                    mapType: "$map.map_type",
                    scenarioType: "$scenario.scen_type",
                    scenario: "$scen_id",
                    map: "$map_id",
                    agents: "$agents",
                    algorithm: "$algo_id",
                    all: null,
                  }
                )(rest).build(),
              ])
        )
      )
  );
};

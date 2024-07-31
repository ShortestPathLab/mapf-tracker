import { mapValues, round, sumBy } from "lodash";
import { CollectionWithInstances } from "core/types";

export const aggregateInstances = <T extends CollectionWithInstances>(
  c: T[]
) => ({
  collection: c,
  closed: sumBy(c, "instances_closed"),
  solved: sumBy(c, "instances_solved"),
  instances: sumBy(c, "instances"),
});

export const getInstanceAggregateProportions = <
  T extends CollectionWithInstances
>(
  c: ReturnType<typeof aggregateInstances> & { collection: T[] }
) => ({
  ...c,
  proportionClosed: c.instances ? c.closed / c.instances : 0,
  proportionSolved: c.instances ? c.solved / c.instances : 0,
  proportionAll: 1,
});

export const roundValues =
  <T extends {}>(to: number = 0) =>
  (c: T) =>
    mapValues(c, (v) => (typeof v === "number" ? round(v, to) : v));

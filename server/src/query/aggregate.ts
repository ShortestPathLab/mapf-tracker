import { AggregateBuilder } from "mongodb-aggregate-builder";

export const build = (f: (p: AggregateBuilder) => AggregateBuilder) =>
  f(new AggregateBuilder()).build();

type Operation = "sum" | "avg" | "min" | "max";

const agg = <T extends Operation>(
  op: T,
  cond: any = undefined,
  ifTrue: any = 1,
  ifFalse: any = 0
) =>
  ({
    [`$${op}`]: cond
      ? {
          $cond: [cond, ifTrue, ifFalse],
        }
      : ifTrue,
  } as { [K in `$${T}`]: any });

export const operations = {
  count: (cond?: any, _value?: unknown) => agg("sum", cond),
  avg: (cond?: any, value?: any) => agg("avg", cond, value),
  sum: (cond?: any, value?: any) => agg("sum", cond, value),
  min: (cond?: any, value?: any) => agg("min", cond, value),
  max: (cond?: any, value?: any) => agg("max", cond, value),
};

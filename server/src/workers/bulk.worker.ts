import { connectToDatabase } from "connection";
import { flatMap, last, range, zip } from "lodash";
import { Instance, Scenario } from "models";
import { createPrecomputeHandler } from "query/withDiskCache";
import { getSolutionPathsRaw } from "utils/solutionPath";
import { get } from "models/Version";

export type BulkOptions = {
  scenario: string;
  solutions: boolean;
  skip: number;
  limit: number;
};

async function run({
  scenario: id,
  solutions: includeSolutions,
  skip,
  limit,
}: BulkOptions) {
  await connectToDatabase();
  const instances = await Instance.find({ scen_id: id })
    .skip(skip)
    .limit(limit);
  const solutions = includeSolutions
    ? await getSolutionPathsRaw(
      instances.map((i) => {
        const id =
          i?.solution_path_id?.toString?.() ??
          last(i?.solution_algos)?.submission_id?.toString?.();
        return id ?? "";
      })
    )
    : [];
  return await Promise.all(
    zip(instances, solutions).map(async ([instance, s1]) => {
      const {
        solution_algos,
        solution_path_id,
        agents,
        lower_cost,
        solution_cost,
        map_name,
        scenario_type,
        scenario_type_id,
      } = instance!;
      const id =
        solution_path_id?.toString() ??
        last(solution_algos)?.submission_id?.toString();
      return {
        map_name,
        scen_type: scenario_type,
        type_id: scenario_type_id,
        agents,
        lower_cost: lower_cost ?? null,
        solution_cost: solution_cost ?? null,
        ...(id &&
          includeSolutions && {
          flip_up_down: true,
          solution_plan: s1,
        }),
      };
    })
  );
}

export const { precompute, handler } = createPrecomputeHandler(
  import.meta.path,
  "bulk-results",
  (p) => run(p),
  {
    invalidationKey: () => get("diskCache"),
    precompute: async () => {
      await connectToDatabase();
      const scenarios = await Scenario.find({}, { _id: 1, instances: 1 });
      const chunkSize = 500;
      return flatMap(scenarios, ({ _id, instances }) => {
        return range(0, instances!, chunkSize).map(
          (start) =>
            [
              {
                solutions: true,
                scenario: _id.toString(),
                skip: start,
                limit: chunkSize,
              },
            ] as [any]
        );
      });
    },
  }
);

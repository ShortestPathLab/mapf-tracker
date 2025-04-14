import { connectToDatabase } from "connection";
import { flatMap, last, pick, range, zip } from "lodash";
import { Instance, Scenario } from "models";
import { createPrecomputeHandler } from "query/withDiskCache";
import { findMap, findScenario } from "./findMemo";
import { getSolutionPathsRaw } from "./solutionPath";

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
  await connectToDatabase(32);
  const instances = await Instance.find({ scen_id: id })
    .skip(skip)
    .limit(limit);
  const scenario = await findScenario(id);
  const map = await findMap(scenario!.map_id!.toString());
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
      } = instance!;
      const id =
        solution_path_id?.toString() ??
        last(solution_algos)?.submission_id?.toString();
      return {
        map_name: map!.map_name,
        scen_type: scenario!.scen_type,
        type_id: scenario!.type_id,
        agents: agents,
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
    precompute: async () => {
      await connectToDatabase(32);
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

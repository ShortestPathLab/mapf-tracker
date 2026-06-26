import { connectToDatabase } from "connection";
import { once } from "lodash";
import { Instance } from "models";
import { get } from "models/Version";
import { createPrecomputeHandler } from "query/withDiskCache";
import { usingTaskMessageHandler } from "queue/usingWorker";
import { getSolutionPath } from "utils/solutionPath";
import { makespan } from "validator-wasm";

export type MakespanData = {
  instance?: string;
  solutionPath?: string;
};

// The makespan is a pure function of the solution path it resolves to, so the
// disk cache keys on the single resolved id (`solutionPath ?? instance`) rather
// than the raw body. This keeps the key canonical regardless of body
// shape/ordering, so a precomputed entry is hit verbatim by the live request.
const key = ({ instance, solutionPath }: MakespanData) =>
  solutionPath ?? instance ?? "";

const run = async (params: MakespanData): Promise<number | null> => {
  const id = key(params);
  if (!id) return null;
  const paths = await getSolutionPath(id, "submitted");
  if (!paths) return null;
  return makespan(paths);
};

export const { precompute, handler } = createPrecomputeHandler(
  import.meta.path,
  "map-makespan",
  (p) => run(p),
  {
    resolver: key,
    invalidationKey: () => get("diskCache"),
    // Warm one entry per instance, matching the `{ instance, solutionPath }`
    // body the client sends (see `useMakespanData`). Both fields are included
    // so the warmed key matches whether or not the instance has a solution.
    precompute: async () => {
      const instances = await Instance.find({}, { _id: 1, solution_path_id: 1 });
      return instances.map((i) => [
        {
          instance: i._id.toString(),
          solutionPath: i.solution_path_id?.toString(),
        },
      ]) as [MakespanData][];
    },
  }
);

const connect = once(connectToDatabase);

if (!Bun.isMainThread) {
  self.onmessage = usingTaskMessageHandler<MakespanData, any>(async (d) => {
    await connect();
    return await run(d);
  });
}

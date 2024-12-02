import { mapValues } from "lodash";
import csv from "neat-csv";
import { usingTaskMessageHandler, usingWorkerTask } from "queue/usingWorker";
import sizeof from "object-sizeof";

export type Params = unknown;

export type Result = number;

export const estimateSizeAsync = usingWorkerTask<Params, Result>(
  () => new Worker(import.meta.path)
);

if (!Bun.isMainThread) {
  self.onmessage = usingTaskMessageHandler<Params, Result>(async (d) =>
    sizeof(d)
  );
}

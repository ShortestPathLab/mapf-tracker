import { chunk, head, throttle, ThrottleSettingsLeading, times } from "lodash";
import stringHash from "string-hash";
import { createPair } from "../queue/createPair";
import { usingWorkerTaskReusable } from "../queue/usingWorker";
import { SubmissionValidatorData } from "./SubmissionValidatorData";
import { path } from "./submissionValidatorWorker";

export const createSubmissionValidator = async ({
  workerCount = 1,
}: { workerCount?: number } = {}) => {
  const instances = await Promise.all(
    times(workerCount, (i) => {
      const run = usingWorkerTaskReusable<SubmissionValidatorData, any>(
        () => new Worker(path)
      );
      return createPair<SubmissionValidatorData, "validate", void>(
        `${i}`,
        run,
        "validation",
        "Validation Dispatcher"
      );
    })
  );
  let i = 0;
  return {
    add: (jobs: SubmissionValidatorData) => {
      for (const c of chunk(jobs, +process.env.VALIDATOR_BATCH_COUNT || 64)) {
        instances[i % workerCount].server.queue.add("validate", c);
        i++;
      }
    },
    instances,
    close: async () => {
      for (const { server: queue, worker } of instances) {
        await worker.close();
        await queue.close();
      }
    },
  };
};

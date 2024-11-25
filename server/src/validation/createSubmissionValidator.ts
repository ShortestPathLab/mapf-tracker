import { times } from "lodash";
import { SubmissionValidatorData } from "./SubmissionValidatorData";
import {
  usingWorkerReusable,
  usingWorkerTask,
  usingWorkerTaskReusable,
} from "../queue/usingWorker";
import { path } from "./submissionValidatorWorker";
import stringHash from "string-hash";
import { createPair } from "../queue/createPair";

const run = usingWorkerTaskReusable<SubmissionValidatorData, any>(
  () => new Worker(path)
);

const id = ({ apiKey, submissionId }: SubmissionValidatorData) =>
  stringHash(JSON.stringify({ apiKey, submissionId }));

export const createSubmissionValidator = async ({
  workerCount = 1,
}: { workerCount?: number } = {}) => {
  const instances = await Promise.all(
    times(workerCount, (i) =>
      createPair<SubmissionValidatorData, "validate", void>(
        `${i}`,
        run,
        "validation",
        "Validation Dispatcher"
      )
    )
  );
  return {
    add: (data: SubmissionValidatorData) => {
      instances[id(data) % workerCount].server.queue.add("validate", data, {
        lifo: true,
      });
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

import { times } from "lodash";
import { SubmissionValidatorData } from "./SubmissionValidatorData";
import { usingWorkerTask } from "../queue/usingWorker";
import { path } from "./submissionValidatorWorker";
import stringHash from "string-hash";
import { createPair } from "../queue/createPair";

const run = usingWorkerTask<SubmissionValidatorData, any>(
  () => new Worker(path)
);

const id = ({
  apiKey,
  mapId,
  scenarioId,
  agentCountIntent,
}: SubmissionValidatorData) =>
  stringHash(JSON.stringify({ apiKey, mapId, scenarioId, agentCountIntent }));

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

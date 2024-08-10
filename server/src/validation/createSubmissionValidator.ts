import { Worker as BullmqWorker, Job } from "bullmq";
import { times } from "lodash";
import { context } from "logging";
import { createQueue } from "./createQueue";
import { SubmissionValidatorData } from "./SubmissionValidatorData";
import { usingWorkerTask } from "./usingWorker";
import { path } from "./submissionValidatorWorker";
import stringHash from "string-hash";

const run = usingWorkerTask<SubmissionValidatorData, any>(
  () => new Worker(path)
);

const QUEUE_NAME = "validation";

export const createPair = async (id: string) => {
  const name = `${QUEUE_NAME}-${id}`;
  const server = await createQueue<SubmissionValidatorData, {}, "validate">({
    name,
  });
  const worker = new BullmqWorker(
    name,
    async (job: Job<SubmissionValidatorData>) => {
      const log = context(`Validation Dispatcher ${id}`);
      log.info(`Dispatching job ${job.id}`);
      const out = await run(job.data);
      log.info(`Job ${job.id} returned`, out);
      return out;
    },
    {
      // Do not change this value to anything more than 1, as it'll introduce race conditions.
      concurrency: 1,
      connection: {
        host: server.host,
        port: server.port,
      },
    }
  );
  return { server, worker };
};

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
    times(workerCount, (i) => createPair(`${i}`))
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

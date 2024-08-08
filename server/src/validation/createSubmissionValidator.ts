import { Worker as BullmqWorker, Job } from "bullmq";
import { times } from "lodash";
import { context } from "logging";
import { createQueue } from "./createQueue";
import { SubmissionValidatorData } from "./SubmissionValidatorData";
import { usingWorkerTask } from "./usingWorker";
import { path } from "./submissionValidatorWorker";

const log = context("Validation Dispatcher");

const run = usingWorkerTask<SubmissionValidatorData, any>(
  () => new Worker(path)
);

const QUEUE_NAME = "validation";

export const createSubmissionValidator = async ({
  workerCount = 1,
}: { workerCount?: number } = {}) => {
  const validator = await createQueue<SubmissionValidatorData, {}, "validate">({
    name: QUEUE_NAME,
  });
  const workers = times(
    workerCount,
    (i) =>
      new BullmqWorker(
        QUEUE_NAME,
        async (job: Job<SubmissionValidatorData>) => {
          log.info(`Dispatching job ${job.id}`);
          const out = await run(job.data);
          log.info(`Job ${job.id} returned`, out);
          return out;
        },
        {
          concurrency: 16,
          connection: {
            host: validator.host,
            port: validator.port,
          },
        }
      )
  );

  return {
    validator,
    workers,
    close: async () => {
      for (const w of workers) await w.close();
      await validator.close();
    },
  };
};

import { Worker } from "bullmq";
import { times } from "lodash";
import { createQueue } from "./createQueue";
import { url } from "./submissionValidator.worker";
import { SubmissionValidatorData } from "./SubmissionValidatorData";

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
      new Worker(QUEUE_NAME, url, {
        connection: {
          host: validator.host,
          port: validator.port,
        },
      })
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

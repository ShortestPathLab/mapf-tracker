import { head, throttle, ThrottleSettingsLeading, times } from "lodash";
import stringHash from "string-hash";
import { createPair } from "../queue/createPair";
import { usingWorkerTaskReusable } from "../queue/usingWorker";
import { SubmissionValidatorData } from "./SubmissionValidatorData";
import { path } from "./submissionValidatorWorker";

function collect<U, V>(
  f: (u: U[]) => V,
  wait: number = 300,
  collect: number = 1024,
  options?: ThrottleSettingsLeading
) {
  let collection = [];
  const execute = () => {
    const copy = [...collection];
    collection = [];
    if (copy.length) {
      f(copy);
    }
  };
  const g = throttle(execute, wait, options);
  return (arg: U) => {
    collection.push(arg);
    if (collection.length >= collect) {
      execute();
    } else {
      g();
    }
  };
}

const run = usingWorkerTaskReusable<SubmissionValidatorData, any>(
  () => new Worker(path)
);

const id = ({ apiKey, submissionId }: SubmissionValidatorData[number]) =>
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
    add: collect<SubmissionValidatorData[number], void>(
      (jobs) => {
        instances[id(head(jobs)) % workerCount].server.queue.add(
          "validate",
          jobs
        );
      },
      +process.env.VALIDATOR_BATCH_TIMEOUT || 1000,
      +process.env.VALIDATOR_BATCH_COUNT || 64
    ),
    instances,
    close: async () => {
      for (const { server: queue, worker } of instances) {
        await worker.close();
        await queue.close();
      }
    },
  };
};

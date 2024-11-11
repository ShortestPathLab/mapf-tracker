import { each, map, now } from "lodash";
import { dispatcher } from "./dispatcher";
import { Job } from "bullmq";
import { context } from "logging";
import { PipelineTaskData, PipelineTaskResult } from "./PipelineTaskData";

const log = context("Pipeline");

export type PipelineStage<
  T extends Record<string, any> | void = void,
  R extends Record<string, any> | void = void
> = {
  key: string;
  destructive?: boolean;
  run: (a?: T) => Promise<{ result: any; variables?: R }>;
  dependents: PipelineStage<R>[];
  description?: string;
};

type StatusType = "invalidated" | "done" | "running" | "error" | "pending";

export type Status = {
  type: StatusType;
  stage: string;
  variables: any;
  timestamp: number;
  error?: any;
};

export type Options = {
  onProgress?: (args: Status) => void;
  one?: boolean;
};

/**
 * Runs a pipeline stage and all its dependents.
 *
 * @param stage - The stage to run.
 * @param variables - The variables to pass to the stage.
 * @param options - The options to pass to the stage.
 */
export async function run<T extends Record<string, any> | void = void>(
  stage: PipelineStage<T, any>,
  variables?: T,
  options?: Options
) {
  const l = (p: StatusType, s = stage.key, v: any = variables, e?: any) => {
    const event = {
      type: p,
      stage: s,
      variables: v,
      timestamp: now(),
      error: e,
    };
    options?.onProgress?.(event);
    log.info(p, event);
  };
  each(stage.dependents, (d) => l("invalidated", d.key, {}));
  l("pending");
  const job = await dispatcher.server.queue.add("run", {
    stage: stage.key,
    variables,
  });
  await job.waitUntilFinished(dispatcher.server.events);
  const {
    returnvalue: { error, variables: v },
    failedReason,
  } = await Job.fromId<PipelineTaskData, PipelineTaskResult>(
    dispatcher.server.queue,
    job.id
  );
  if (failedReason || error) {
    l("error", stage.key, variables, failedReason ?? error);
    return;
  }
  l("done");
  if (!options?.one) {
    await Promise.all(map(stage.dependents, (d) => run(d, v, options)));
  }
}

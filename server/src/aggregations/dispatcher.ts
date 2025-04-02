import { createPair } from "queue/createPair";
import { usingWorkerTaskReusable } from "queue/usingWorker";
import { PipelineTaskData, PipelineTaskResult } from "./PipelineTaskData";
import { path } from "./PipelineWorker";

export const dispatcher = await createPair<
  PipelineTaskData,
  "run",
  PipelineTaskResult
>(
  "default",
  usingWorkerTaskReusable<PipelineTaskData, PipelineTaskResult>(
    () => new Worker(path)
  ),
  "pipeline",
  "Pipeline Dispatcher"
);

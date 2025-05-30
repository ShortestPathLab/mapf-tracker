import { connectToDatabase } from "connection";
import { stages } from "../aggregations";
import { usingTaskMessageHandler } from "../queue/usingWorker";
import { PipelineTaskData, PipelineTaskResult } from "./PipelineTaskData";
import { set } from "models/PipelineStatus";
import { now } from "lodash";

async function run({
  stage,
  variables,
}: PipelineTaskData): Promise<PipelineTaskResult> {
  if (!(stage in stages)) return { error: "invalid stage" };
  try {
    await connectToDatabase();
    //FIXME: Someone separate this to be handled in the main thread
    set(stage, { type: "running", stage, variables, timestamp: now() });
    await stages[stage as keyof typeof stages].run(variables);
    return {};
  } catch (e) {
    return {
      error: `error while running stage ${stage}: ${inferErrorMessage(e)}`,
    };
  }
}

export const path = import.meta.path;

if (!Bun.isMainThread) {
  self.onmessage = usingTaskMessageHandler<PipelineTaskData, any>(run);
}

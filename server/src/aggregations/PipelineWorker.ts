import { stages } from "../aggregations";
import { usingMessageHandler } from "../queue/usingWorker";
import { PipelineTaskData, PipelineTaskResult } from "./PipelineTaskData";

async function run({
  stage,
  variables,
}: PipelineTaskData): Promise<PipelineTaskResult> {
  if (!(stage in stages)) return { error: "invalid stage" };
  try {
    await stages[stage as keyof typeof stages].run(variables);
    return {};
  } catch (e) {
    return { error: `error while running stage ${stage}: ${e?.message}` };
  }
}

export const path = import.meta.path;

if (!Bun.isMainThread) {
  self.onmessage = usingMessageHandler<PipelineTaskData, any>(({ data }) =>
    run(data)
  );
}

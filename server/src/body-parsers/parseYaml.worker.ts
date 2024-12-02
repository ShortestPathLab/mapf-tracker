import { loadAll } from "js-yaml";
import { head } from "lodash";
import { usingTaskMessageHandler, usingWorkerTask } from "queue/usingWorker";
export type YamlParserWorkerParams = string;

export type YamlParserWorkerResult = any;

export const parseYamlAsync = usingWorkerTask(
  () => new Worker(import.meta.path)
) as <T = YamlParserWorkerResult>(d: YamlParserWorkerParams) => Promise<T>;

if (!Bun.isMainThread) {
  self.onmessage = usingTaskMessageHandler<
    YamlParserWorkerParams,
    YamlParserWorkerResult
  >(async (d) => {
    const data = loadAll(d);
    return data.length > 1 ? data : head(data);
  });
}

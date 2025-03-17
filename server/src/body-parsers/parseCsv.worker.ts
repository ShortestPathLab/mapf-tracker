import { mapValues } from "lodash";
import csv from "neat-csv";
import {
  usingTaskMessageHandler,
  usingWorkerTask,
  usingWorkerTaskReusable,
} from "queue/usingWorker";

export type CsvParserWorkerParams = string;

export type CsvParserWorkerResult = any;

export const parseCsvAsync = usingWorkerTaskReusable(
  () => new Worker(import.meta.path)
) as <T = CsvParserWorkerResult>(d: CsvParserWorkerParams) => Promise<T>;

if (!Bun.isMainThread) {
  self.onmessage = usingTaskMessageHandler<
    CsvParserWorkerParams,
    CsvParserWorkerResult
  >(async (d) =>
    (await csv(d)).map((x) =>
      mapValues(x, (v: any) =>
        // Coerce boolean
        v === "TRUE"
          ? true
          : v === "FALSE"
          ? false
          : // Coerce number
          isNaN(+v) || v === ""
          ? v
          : +v
      )
    )
  );
}

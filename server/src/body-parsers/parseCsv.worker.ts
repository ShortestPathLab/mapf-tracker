import { mapValues } from "lodash";
import csv from "neat-csv";
import {
  usingTaskMessageHandler,
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
      mapValues(x, (v: string) =>
        v === ""
          ? undefined
          : // Coerce boolean
          v.toUpperCase() === "TRUE"
          ? true
          : v.toUpperCase() === "FALSE"
          ? false
          : // Coerce number
          isNaN(+v) || v === ""
          ? v
          : +v
      )
    )
  );
}

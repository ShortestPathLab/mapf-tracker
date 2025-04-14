import { JSONParser } from "@streamparser/json";
import { APIConfig } from "core/config";
import { ceil, map, noop, range, throttle } from "lodash";
import { parallel } from "promise-tools";
import { post } from "queries/mutation";
import type { Job } from "./useBulkMutation";

export const CHUNK_LIMIT = 500;

export const resultQuery = async (
  id: string,
  limit: number,
  solutions: boolean,
  onProgress?: (p: Partial<Job>) => void,
  onNode?: (n: unknown) => void
) => {
  const progress = throttle<(p?: Partial<Job>) => void>(
    onProgress ?? noop,
    300
  );
  const PARALLEL_LIMIT = 2;
  let count = 0;
  const chunks = ceil(limit / CHUNK_LIMIT);
  onProgress?.({
    status: "Starting download",
  });
  await parallel(
    map(
      range(chunks),
      (c) => () =>
        new Promise<void>((res) => {
          const parser = new JSONParser({
            // 16 MB buffer
            stringBufferSize: 16 * 1024 * 1024,
            paths: ["$.*"],
          });
          parser.onValue = (n) => {
            count++;
            onNode?.(n.value);
            progress({
              status: `Downloading (${count} of ${limit})`,
              progress: limit ? count / limit : 0,
            });
          };
          parser.onEnd = () => {
            res();
          };
          parser.onError = console.log;
          post(`${APIConfig.apiUrl}/bulk/results`, {
            scenario: id,
            solutions,
            limit: CHUNK_LIMIT,
            skip: c * CHUNK_LIMIT,
          }).then(async (b) => {
            const reader = b.body.getReader();
            while (true) {
              const { done, value } = await reader.read();
              if (done) {
                break;
              }
              parser.write(value);
            }
          });
        })
    ),
    PARALLEL_LIMIT
  );
  progress.flush();
  onProgress?.({ status: "Processing", progress: 1 });
};

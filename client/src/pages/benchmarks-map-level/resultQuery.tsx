import { APIConfig } from "core/config";
import { throttle, noop, ceil, map, range } from "lodash";
import oboe from "oboe";
import { parallel } from "promise-tools";
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
          oboe({
            url: `${APIConfig.apiUrl}/bulk/results`,
            method: "post",
            body: {
              scenario: id,
              solutions,
              limit: CHUNK_LIMIT,
              skip: c * CHUNK_LIMIT,
            },
          })
            .node("!.*", (node) => {
              count++;
              onNode?.(node);
              progress({
                status: `Downloading (${count} of ${limit})`,
                progress: limit ? count / limit : 0,
              });
            })
            .done(res);
        })
    ),
    PARALLEL_LIMIT
  );
  progress.flush();
  onProgress?.({ status: "Processing", progress: 1 });
};

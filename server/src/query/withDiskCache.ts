import { file, gc, gunzipSync, gzipSync, write } from "bun";
import { env } from "env";
import { defer, entries, has, once } from "lodash";
import { log } from "logging";
import hash from "object-hash";
import { retry } from "promise-tools";
import {
  usingTaskMessageHandler,
  usingWorkerTaskReusable,
} from "queue/usingWorker";
import { Glob } from "bun";
import { basename } from "path";

type DiskCacheOptions<T extends any[]> = {
  resolver?: (...args: T) => any;
  precompute?: () => Promise<T[]>;
};

export function withDiskCache<T extends any[], U>(
  name: string,
  f: (...args: T) => Promise<U>,
  {
    precompute = async () => [],
    resolver = (...args) => args[0],
  }: DiskCacheOptions<T> = {}
) {
  const directory = `${env.CACHE_DIRECTORY}/${name}`;
  const glob = new Glob(`${directory}/*`);
  const files = new Set(
    [...glob.scanSync({ absolute: true })].map((p) => basename(p))
  );
  const g =
    (precompute = false) =>
    async (...args: T) => {
      const filename = hash({
        args: resolver?.(...args),
      });
      const path = `${directory}/${filename}`;
      if (files.has(filename)) {
        if (precompute) return;
        try {
          const cacheFile = file(path);
          // This line can fail if the file doesn't exist
          const buffer = cacheFile.arrayBuffer();
          const decoder = new TextDecoder();
          const text = decoder.decode(gunzipSync(await buffer));
          return JSON.parse(text);
        } catch {
          // If error, something's wrong with the cached file.
          // This includes if the file doesn't exist.
          // Run the handler again.
        }
      }
      const next = await f(...args);
      await write(path, gzipSync(JSON.stringify(next)), { createPath: true });
      return precompute ? undefined : next;
    };
  defer(async () => {
    const ps = await precompute();
    if (ps.length) {
      for (const [i, p] of entries(ps)) {
        log.info(
          `Precompute ${+i + 1} of ${ps.length} ${name} ${JSON.stringify(p)}`
        );
        try {
          await retry(() => g(true)(...p));
          gc?.(true);
        } catch (e) {
          log.error(
            `Precompute failed: ${has(e, "message") ? e.message : ""}`,
            e
          );
        }
      }
      log.info(`Precompute ${name} done`);
    }
  });
  return g(false);
}

const SYMBOL_PRECOMPUTE = "symbol-precompute" as const;

export const createPrecomputeHandler = <T, U>(
  path: string,
  name: string,
  run: (a: T) => Promise<U>,
  options: DiskCacheOptions<[T]> = {}
) => {
  const handler = (precompute = false) =>
    withDiskCache(name, run, {
      ...options,
      precompute: precompute ? options.precompute : async () => [],
    });

  const runPrecompute = once(() => handler(true));

  if (Bun.isMainThread) {
    const precompute = usingPrecomputeWorker(() => new Worker(path));
    return { precompute, handler: handler(false) };
  } else {
    self.onmessage = usingTaskMessageHandler<T | typeof SYMBOL_PRECOMPUTE, U>(
      async (t) => {
        if (t === SYMBOL_PRECOMPUTE) {
          runPrecompute();
          return undefined as any;
        }
        return await run(t);
      }
    );
    return {};
  }
};

export const usingPrecomputeWorker = <T, U>(f: () => Worker) => {
  const g = usingWorkerTaskReusable<T | typeof SYMBOL_PRECOMPUTE, U>(f);
  return () => g(SYMBOL_PRECOMPUTE);
};

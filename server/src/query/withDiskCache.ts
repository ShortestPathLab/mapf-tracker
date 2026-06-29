import { file, gc, Glob, gunzipSync, gzipSync, isMainThread, write } from "bun";
import { env } from "env";
import { entries, has, once } from "lodash";
import { log } from "logging";
import hash from "object-hash";
import { basename } from "path";
import { retry } from "promise-tools";
import { usingTaskMessageHandler, usingWorkerTaskReusable } from "queue/usingWorker";

function createCache() {
  const cache: Record<string, () => Promise<unknown>> = {};
  return {
    cache,
    precomputeAll: async () => {
      await Promise.all(entries(cache).map(([, v]) => v()));
    },
    register: (k: string, v: () => Promise<unknown>) => {
      cache[k] = v;
      return v;
    },
  };
}

export const diskCaches = createCache();

type DiskCacheOptions<T extends any[]> = {
  resolver?: (...args: T) => any;
  precompute?: () => Promise<T[]>;
  precomputeInterval?: number;
  invalidationKey?: (...args: T) => Promise<any>;
};

export function diskCached<T extends any[], U>(
  name: string,
  f: (...args: T) => Promise<U>,
  {
    precompute,
    precomputeInterval,
    resolver = (...args) => args[0],
    invalidationKey = async () => ({}),
  }: DiskCacheOptions<T> = {},
) {
  const g =
    (precompute = false) =>
    async (...args: T) => {
      const directory = `${env.CACHE_DIRECTORY}/${name}`;
      const glob = new Glob(`${directory}/*`);
      const filename = hash({
        args: resolver?.(...args),
      });
      const path = `${directory}/${filename}`;
      const currentVersion = hash(await invalidationKey(...args));
      try {
        const files = new Set([...glob.scanSync({ absolute: true })].map((p) => basename(p)));
        if (files.has(filename)) {
          if (precompute) {
            // Warm only what's missing or stale: skip when an entry already
            // exists for the current data version, otherwise fall through and
            // recompute so a version bump actually re-warms the entry. (A bare
            // `return` here would leave stale entries un-refreshed, forcing the
            // next real request to pay the full aggregation.)
            if (files.has(`${filename}.version`)) {
              const version = await file(`${path}.version`).text();
              if (version === currentVersion) return;
            }
          } else {
            if (!files.has(`${filename}.version`)) {
              // If the cache file exists but the version file does not,
              // we assume the cache is fine and write the current version.
              log.warn(`Cache file ${path} exists but version file does not.`);
              await write(`${path}.version`, currentVersion, {
                createPath: true,
              });
            }
            const v = file(`${path}.version`);
            const version = await v.text();
            if (version === currentVersion) {
              const cacheFile = file(path);
              // This line can fail if the file doesn't exist
              const buffer = cacheFile.arrayBuffer();
              const decoder = new TextDecoder();
              const text = decoder.decode(gunzipSync(await buffer));
              return JSON.parse(text);
            }
          }
        }
      } catch {
        // If error, something's wrong with the cached file.
        // This includes if the file doesn't exist.
        // Run the handler again.
      }
      const next = await f(...args);
      try {
        await write(path, gzipSync(JSON.stringify(next)), { createPath: true });
        await write(`${path}.version`, currentVersion, { createPath: true });
      } catch {
        // It's ok if the write fails, we just won't cache the result.
      }
      return precompute ? undefined : next;
    };
  let controller: AbortController | undefined;
  const p = async () => {
    controller?.abort?.();
    controller = new AbortController();
    const ps = await precompute?.();
    if (ps?.length) {
      for (const [i, p] of entries(ps)) {
        if (controller.signal.aborted) {
          log.info(`Precompute ${name} aborted`);
          return;
        }
        log.info(`Precompute ${+i + 1} of ${ps.length} ${name} ${JSON.stringify(p)}`);
        try {
          await retry(() => g(true)(...p));
          gc?.(true);
        } catch (e) {
          log.error(`Precompute failed: ${has(e, "message") ? e.message : ""}`, e);
        }
      }
      log.info(`Precompute ${name} done`);
    }
  };

  // Precompute is triggered explicitly via `diskCaches.precomputeAll()` —
  // either on start when `PRECOMPUTE_ON_START=1` (see `restore`) or by the
  // `precomputeQueries` pipeline stage after the data changes. (A previous
  // `defer(p)` ran it unconditionally on module load, bypassing that flag.)
  if (isMainThread && precompute) {
    diskCaches.register(name, p);
  }

  return g(false);
}

const SYMBOL_PRECOMPUTE = "a31e8647-9474-4d05-9de0-1e95658a7f1f" as const;

export const createPrecomputeHandler = <T, U>(
  path: string,
  name: string,
  run: (a: T) => Promise<U>,
  options: DiskCacheOptions<[T]> = {},
) => {
  const handler = (precompute = false) =>
    diskCached(name, run, {
      ...options,
      precompute: precompute ? options.precompute : undefined,
    });

  const runPrecompute = once(() => handler(true));

  if (Bun.isMainThread) {
    const precompute = usingPrecomputeWorker(() => new Worker(path));
    diskCaches.register(name, precompute);
    return { precompute, handler: handler(false) };
  } else {
    self.onmessage = usingTaskMessageHandler<T | typeof SYMBOL_PRECOMPUTE, U>(async (t) => {
      if (t === SYMBOL_PRECOMPUTE) {
        runPrecompute();
        return undefined as any;
      }
      return await run(t);
    });
    return {};
  }
};

export const usingPrecomputeWorker = <T, U>(f: () => Worker) => {
  const g = usingWorkerTaskReusable<T | typeof SYMBOL_PRECOMPUTE, U>(f);
  return () => g(SYMBOL_PRECOMPUTE);
};

export const restore = async () => {
  if (env.PRECOMPUTE_ON_START) {
    await diskCaches.precomputeAll();
  }
};

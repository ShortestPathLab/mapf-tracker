import { env } from "bun";
import pino from "pino";

const logger = pino();

logger.level = env.LOG_LEVEL || "error";

type Level = "debug" | "info" | "warn" | "error" | "trace" | "fatal";

export const raw = (level: Level, ...params: Params) => {
  const [source, msg, ...payload] = params;
  logger[level](`[${source}] ${msg}`);
  if (payload?.length) for (const p of payload) console[level](p);
};

type Args = [msg?: any, ...payload: any[]];

type Params = [source: string, ...Args];

export const context = (name: string) => {
  const r =
    (l: Level) =>
    (msg: any, ...p: any[]) =>
      raw(l, name, msg, ...p);
  return {
    debug: r("debug"),
    info: r("info"),
    warn: r("warn"),
    error: r("error"),
    trace: r("trace"),
    fatal: r("fatal"),
  } as { [K in Level]: (...a: Args) => void };
};

export let log = context("Main");

export const setContext = (name: string) => {
  log = context(name);
};

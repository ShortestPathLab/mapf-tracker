import pino from "pino";
import { dump } from "js-yaml";

const logger = pino();

type Level = "debug" | "info" | "warn" | "error" | "trace" | "fatal";

export const raw = (level: Level, ...params: Params) => {
  const [source, msg, ...payload] = params;
  logger[level](`[${source}] ${msg}`);
  if (payload?.length) for (const p of payload) console[level](p);
};

type Args = [msg?: any, ...payload: any[]];

type Params = [source: string, ...Args];

export const context = (name: string) =>
  ({
    debug: (msg, ...p) => raw("debug", name, msg, ...p),
    info: (msg, ...p) => raw("info", name, msg, ...p),
    warn: (msg, ...p) => raw("warn", name, msg, ...p),
    error: (msg, ...p) => raw("error", name, msg, ...p),
    trace: (msg, ...p) => raw("trace", name, msg, ...p),
    fatal: (msg, ...p) => raw("fatal", name, msg, ...p),
  } as { [K in Level]: (...a: Args) => void });

export let log = context("Main");

export const setContext = (name: string) => {
  log = context(name);
};

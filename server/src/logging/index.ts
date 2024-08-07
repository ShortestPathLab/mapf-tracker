import pino from "pino";

const logger = pino();

type Level = "debug" | "info" | "warn" | "error" | "trace" | "fatal";

export const raw = (level: Level, ...params: Params) => {
  const [source, msg, ...payload] = params;
  logger[level](payload, `[${source}] ${msg}`);
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

console.log = log.info;
console.warn = log.warn;
console.error = log.error;
console.info = log.info;

export const setContext = (name: string) => {
  log = context(name);
};

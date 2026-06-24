import { env, general } from "env";
import { Elysia } from "elysia";
import { isNumber, mergeWith } from "lodash";
import b1 from "pretty-bytes";
import { currentLoad, fsSize, mem, networkStats } from "systeminformation";
import { requireAuth } from "auth";
import { log } from "logging";

const b = (n: number) => b1(n ?? 0);

const agg = <T>(t: T[]): T =>
  mergeWith(...(t as []), (a: unknown, b: unknown) =>
    isNumber(a) && isNumber(b) ? a + b : undefined,
  );

export const infoRoutes = new Elysia({ prefix: "/api/info" }).guard(
  { beforeHandle: requireAuth },
  (app) =>
    app
      .get("/general", async () => {
        const m = await mem();
        const c = await currentLoad();
        const n = agg(await networkStats());
        const d = agg(await fsSize());
        return {
          ...general,
          processor: `${c.currentLoad.toFixed(2)}%`,
          memory: `${b(m.used)} / ${b(m.total)}`,
          disk: `${b(d.used)} / ${b(d.size)}`,
          network: `${b(n.rx_sec)}/s down, ${b(n.tx_sec)}/s up`,
        };
      })
      .get("/environment", async () => env)
      .get("/logs", async () => log.recent),
);

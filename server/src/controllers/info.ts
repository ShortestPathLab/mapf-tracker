import { env, general } from "env";
import { Application, Router } from "express";
import { log } from "logging";
import passport from "passport";
import { route } from "query";
import { z } from "zod";
import { currentLoad, mem, networkStats, fsSize } from "systeminformation";
import b1 from "pretty-bytes";
import { isNumber, mergeWith } from "lodash";

const b = (n: number) => b1(n ?? 0);

const agg = <T>(t: T[]): T =>
  mergeWith(...(t as []), (a: unknown, b: unknown) =>
    isNumber(a) && isNumber(b) ? a + b : undefined
  );

export const use = (app: Application, path: string = "/api/info") =>
  app.use(
    path,
    passport.authenticate("jwt", { session: false }),
    Router()
      .get(
        "/general",
        route(z.unknown(), async () => {
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
      )
      .get(
        "/environment",
        route(z.unknown(), async () => {
          return env;
        })
      )
      .get(
        "/logs",
        route(z.unknown(), async () => {
          return log.recent;
        })
      )
  );

import { env, general } from "config/db";
import { Application, Router } from "express";
import { log } from "logging";
import passport from "passport";
import { route } from "query";
import { z } from "zod";

export const use = (app: Application, path: string = "/api/info") =>
  app.use(
    path,
    passport.authenticate("jwt", { session: false }),
    Router()
      .get(
        "/general",
        route(z.unknown(), async () => {
          return general;
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

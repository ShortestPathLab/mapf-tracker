import { env } from "config/db";
import { Application, Router } from "express";
import passport from "passport";
import { route } from "query";
import { z } from "zod";

export const use = (app: Application, path: string = "/api/info") =>
  app.use(
    path,
    passport.authenticate("jwt", { session: false }),
    Router().get(
      "/environment",
      route(z.unknown(), async () => {
        return env;
      })
    )
  );

import { Application, Router } from "express";
import { route } from "query";
import { z } from "zod";
import { handler as bulkAsync } from "./bulk.worker";

export const use = (app: Application, path = "/api/bulk") =>
  app.use(
    path,
    Router().post(
      "/results",
      route(
        z.object({
          scenario: z.string(),
          solutions: z.boolean().optional().default(false),
          skip: z.number().default(0),
          limit: z.number().default(Infinity),
        }),
        bulkAsync,
        { source: "body" }
      )
    )
  );

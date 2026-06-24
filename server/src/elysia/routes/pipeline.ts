import { Elysia } from "elysia";
import { requireAuth } from "auth";
import * as pipeline from "../../controllers/pipeline";

export const pipelineRoutes = new Elysia({ prefix: "/api/pipeline" })
  .guard({ beforeHandle: requireAuth }, (app) =>
    app
      .get("/status", pipeline.getStatus)
      .get("/run/:stage", pipeline.runStage(false))
      .get("/runOne/:stage", pipeline.runStage(true)),
  );

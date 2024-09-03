import { getStatus, runStage } from "controllers/pipeline";
import { Application, Router } from "express";

export default (app: Application) => {
  const router = Router();

  router.get("/status", getStatus);
  router.get("/run/:stage", runStage(false));
  router.get("/runOne/:stage", runStage(true));

  app.use("/api/pipeline", router);
};

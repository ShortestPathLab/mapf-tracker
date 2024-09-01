import { getStatus, runStage } from "controllers/pipeline";
import { Application, Router } from "express";

export default (app: Application) => {
  const router = Router();

  router.get("/status", getStatus);
  router.get("/run/:stage", runStage);

  app.use("/api/pipeline", router);
};

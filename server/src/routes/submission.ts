import { Router, Application } from "express";
import * as submission from "../controllers/submission";

export default (app: Application) => {
  const router = Router();
  router.get("/summary/:algorithm", submission.summaryByAlgorithm);
  router.get("/:algorithm/:scenario", submission.byScenario);
  app.use("/api/submission", router);
};

import { Router, Application } from "express";
import * as submission from "../controllers/submission";

export default (app: Application) => {
  const router = Router();
  router.get("/summary/:algorithm", submission.summaryByAlgorithm);
  router.get("/:algorithm/:scenario", submission.byScenario);
  router.get("/instance/:id", submission.findByInstance_id);
  router.get("/leadingSolution/:id", submission.findLeadingSolutionInstance_id);
  router.get(
    "/leadingLowerbound/:id",
    submission.findLeadingLowerboundInstance_id
  );
  app.use("/api/submission", router);
};

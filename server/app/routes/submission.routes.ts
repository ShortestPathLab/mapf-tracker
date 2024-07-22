import { Router } from "express";
import * as submission from "../controllers/submission.controller";

export default (app) => {
  const router = Router();

  router.get("/instance/:id", submission.findByInstance_id);
  router.get("/leadingSolution/:id", submission.findLeadingSolutionInstance_id);
  router.get(
    "/leadingLowerbound/:id",
    submission.findLeadingLowerboundInstance_id
  );
  app.use("/api/submission", router);
};

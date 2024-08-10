import { Router, Application } from "express";
import * as solution_submission from "../controllers/solutionSubmission";

export default (app: Application) => {
  const router = Router();
  router.get(
    "/leadingSolution/:id",
    solution_submission.findLeadingSolutionByInstance_id
  );
  router.get(
    "/leadingSolution/:id/:agents",
    solution_submission.findLeadingSolutionByInstance_idAndAgents
  );

  app.use("/api/solution_submission", router);
};

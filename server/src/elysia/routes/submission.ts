import { Elysia } from "elysia";
import { byScenario, summaryByAlgorithm } from "../../controllers/submission";

export const submissionRoutes = new Elysia({ prefix: "/api/submission" })
  .get("/summary/:algorithm", summaryByAlgorithm)
  .get("/:algorithm/:scenario", byScenario);

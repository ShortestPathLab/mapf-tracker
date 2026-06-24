import { Elysia } from "elysia";
import { Submission, submissions } from "models";
import { Types } from "mongoose";
import { cached } from "query";
import { usingWorkerTaskReusable } from "queue/usingWorker";
import {
  SummaryByAlgorithmResult,
  path as summaryByAlgorithmWorkerPath,
} from "workers/summaryByAlgorithm.worker";

const summaryByAlgorithmWorker = usingWorkerTaskReusable<
  unknown,
  SummaryByAlgorithmResult
>(() => new Worker(summaryByAlgorithmWorkerPath));

const summaryByAlgorithm = cached(
  async ({ params }) => summaryByAlgorithmWorker(params),
  { watch: [Submission] },
);

const byScenario = submissions.query(({ params }) => [
  {
    scen_id: new Types.ObjectId(params.scenario),
    algo_id: new Types.ObjectId(params.algorithm),
  },
  [
    "agents",
    "date",
    "lower_cost",
    "solution_cost",
    "best_lower",
    "best_solution",
    "instance_id",
  ],
]);

export const submissionRoutes = new Elysia({ prefix: "/api/submission" })
  .get("/summary/:algorithm", summaryByAlgorithm)
  .get("/:algorithm/:scenario", byScenario);

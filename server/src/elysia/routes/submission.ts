import { Elysia, type Context } from "elysia";
import { Submission } from "models";
import { Types } from "mongoose";
import { cached } from "query";
import { usingWorkerTaskReusable } from "queue/usingWorker";
import { allToJSON } from "utils/toJSON";
import {
  SummaryByAlgorithmResult,
  path as summaryByAlgorithmWorkerPath,
} from "workers/summaryByAlgorithm.worker";

const summaryByAlgorithmWorker = usingWorkerTaskReusable<unknown, SummaryByAlgorithmResult>(
  () => new Worker(summaryByAlgorithmWorkerPath),
);

const summaryByAlgorithm = cached(async ({ params }) => summaryByAlgorithmWorker(params), {
  watch: [Submission],
});

const byScenario = async ({ params }: Context) =>
  Submission.find(
    {
      scen_id: new Types.ObjectId(params.scenario),
      algo_id: new Types.ObjectId(params.algorithm),
    },
    {
      agents: 1,
      date: 1,
      lower_cost: 1,
      solution_cost: 1,
      best_lower: 1,
      best_solution: 1,
      instance_id: 1,
    },
  ).then(allToJSON);

export const submissionRoutes = new Elysia({ prefix: "/api/submission" })
  .get("/summary/:algorithm", summaryByAlgorithm)
  .get("/:algorithm/:scenario", byScenario);

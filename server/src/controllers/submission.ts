import { Submission, submissions } from "models";
import { Types } from "mongoose";
import {
  SummaryByAlgorithmResult,
  path as summaryByAlgorithmWorkerPath,
} from "controllers/summaryByAlgorithm.worker";
import { usingWorkerTaskReusable } from "queue/usingWorker";
import { cached } from "query";

const summaryByAlgorithmWorker = usingWorkerTaskReusable<
  unknown,
  SummaryByAlgorithmResult
>(() => new Worker(summaryByAlgorithmWorkerPath));

export const summaryByAlgorithm = cached(
  async ({ params }) => summaryByAlgorithmWorker(params),
  { watch: [Submission] },
);

export const byScenario = submissions.query(({ params }) => [
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

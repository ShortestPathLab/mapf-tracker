import { Submission, submissions } from "models";
import { Types } from "mongoose";
import {
  SummaryByAlgorithmResult,
  path as summaryByAlgorithmWorkerPath,
} from "controllers/summaryByAlgorithm.worker";
import { usingWorkerTaskReusable } from "queue/usingWorker";
import { z } from "zod";
import { cached } from "query";

export const byScenario = submissions.query(
  z.object({ scenario: z.string(), algorithm: z.string() }),
  ({ scenario, algorithm }) => [
    {
      scen_id: new Types.ObjectId(scenario),
      algo_id: new Types.ObjectId(algorithm),
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
  ]
);

export const summaryByAlgorithm = cached(
  [Submission],
  z.unknown(),
  async (args) => await summaryByAlgorithmWorker(args)
);

const summaryByAlgorithmWorker = usingWorkerTaskReusable<
  unknown,
  SummaryByAlgorithmResult
>(() => new Worker(summaryByAlgorithmWorkerPath));

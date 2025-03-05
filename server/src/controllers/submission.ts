import { RequestHandler } from "express";
import { Submission, submissions } from "models";
import { Types } from "mongoose";
import {
  SummaryByAlgorithmResult,
  path as summaryByAlgorithmWorkerPath,
} from "controllers/summaryByAlgorithm.worker";
import { usingWorkerTaskReusable } from "queue/usingWorker";
import { z } from "zod";
import { cached } from "query";

const { ObjectId } = Types;

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

export const findLeadingSolutionInstance_id: RequestHandler = (req, res) => {
  const { id } = req.params;

  Submission.find({ instance_id: id, isleading: true, type: "solution" })
    .then((data) => {
      if (!data)
        res
          .status(404)
          .send({ message: `Not leading solution with instance id =${id}` });
      else res.send(data);
    })
    .catch((err) => {
      res
        .status(500)
        .send({ message: `Error leading solution with instance id =${id}` });
    });
};

export const findLeadingLowerboundInstance_id: RequestHandler = (req, res) => {
  const { id } = req.params;

  Submission.aggregate([
    {
      $match: {
        instance_id: new ObjectId(id),
        isleading: true,
        $or: [{ type: "solution", optimal: true }, { type: "lower_bound" }],
      },
    },
    { $sort: { type: -1 } },
    {
      $group: {
        _id: "$agents",
        type: { $first: "$type" },
        algo_name: { $first: "$algo_name" },
        authors: { $first: "$authors" },
        value: { $first: "$value" },
        runtime: { $first: "$runtime" },
        optimal: { $first: "$optimal" },
      },
    },
    { $sort: { _id: 1 } },
  ])
    .then((data) => {
      if (!data)
        res
          .status(404)
          .send({ message: `Not leading solution with instance id =${id}` });
      else res.send(data);
    })
    .catch((err) => {
      res
        .status(500)
        .send({ message: `Error leading solution with instance id =${id}` });
    });
};

export const findByInstance_id: RequestHandler = (req, res) => {
  const { id } = req.params;

  Submission.find({ instance_id: id })
    .then((data) => {
      if (!data)
        res.status(404).send({ message: `Not found Map with id ${id}` });
      else res.send(data);
    })
    .catch((err) => {
      res.status(500).send({ message: `Error retrieving Map with id=${id}` });
    });
};

const summaryByAlgorithmWorker = usingWorkerTaskReusable<
  unknown,
  SummaryByAlgorithmResult
>(() => new Worker(summaryByAlgorithmWorkerPath));

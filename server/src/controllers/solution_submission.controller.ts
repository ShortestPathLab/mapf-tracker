import db from "../models/index";
import { RequestHandler } from "express";
const Solution_submission = db.submissions;
import { Types } from "mongoose";

export const findLeadingSolutionByInstance_id: RequestHandler = (req, res) => {
  const { id } = req.params;

  Solution_submission.find({
    instance_id: new Types.ObjectId(id),
    isleading: true,
  })
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

export const findLeadingSolutionByInstance_idAndAgents: RequestHandler = (
  req,
  res
) => {
  const { id } = req.params;
  const num = req.params.agents;

  Solution_submission.find({
    instance_id: new Types.ObjectId(id),
    agents: Number(num),
  })
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

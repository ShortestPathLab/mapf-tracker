import db from "../models/index";
const Submission = db.submissions;
import { ObjectID as ObjectId } from "mongodb";

export const findLeadingSolutionInstance_id = (req, res) => {
  const id = req.params.id;

  Submission.find({ instance_id: id, isleading: true, type: "solution" })
    .then((data) => {
      if (!data)
        res
          .status(404)
          .send({ message: "Not leading solution with instance id =" + id });
      else res.send(data);
    })
    .catch((err) => {
      res
        .status(500)
        .send({ message: "Error leading solution with instance id =" + id });
    });
};

export const findLeadingLowerboundInstance_id = (req, res) => {
  const id = req.params.id;

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
          .send({ message: "Not leading solution with instance id =" + id });
      else res.send(data);
    })
    .catch((err) => {
      res
        .status(500)
        .send({ message: "Error leading solution with instance id =" + id });
    });
  // Submission.find({instance_id : ObjectId(id) , isleading :  true })
  //     .then(data => {
  //         if (!data)
  //             res.status(404).send({ message: "Not leading solution with instance id =" + id });
  //         else res.send(data);
  //     })
  //     .catch(err => {
  //         res
  //             .status(500)
  //             .send({ message: "Error leading solution with instance id =" + id });
  //     });
};

// Find a single Tutorial with an id
export const findByInstance_id = (req, res) => {
  const id = req.params.id;

  Submission.find({ instance_id: id })
    .then((data) => {
      if (!data)
        res.status(404).send({ message: "Not found Map with id " + id });
      else res.send(data);
    })
    .catch((err) => {
      res.status(500).send({ message: "Error retrieving Map with id=" + id });
    });
};

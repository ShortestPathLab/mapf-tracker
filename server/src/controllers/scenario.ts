import { RequestHandler } from "express";
import { first } from "lodash";
import { Scenario } from "models";
import { Types } from "mongoose";
import { queryClient } from "query";
import { z } from "zod";

const { query } = queryClient(Scenario);

export const findById = query(
  z.object({ id: z.string() }),
  ({ id }) => [
    {
      _id: new Types.ObjectId(id),
    },
  ],
  first
);

export const findAll: RequestHandler = (req, res) => {
  Scenario.find({})
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving instances.",
      });
    });
};

export const findByMap_id: RequestHandler = (req, res) => {
  const { id } = req.params;
  Scenario.find({ map_id: id })
    .sort({ scen_type: 1, type_id: 1 })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving instances.",
      });
    });
};

export const findByMap_id_Map_type: RequestHandler = (req, res) => {
  const { id } = req.params;
  const type = req.params.scen_type;
  Scenario.find({ map_id: id, scen_type: type })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving instances",
      });
    });
};

// export const findById: RequestHandler = (req, res) => {
//   const { id } = req.params;
//   Scenario.find({ _id: id })
//     .then((data) => {
//       res.send(data);
//     })
//     .catch((err) => {
//       res.status(500).send({
//         message:
//           err.message || "Some error occurred while retrieving instances.",
//       });
//     });
// };

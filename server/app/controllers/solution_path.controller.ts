import db from "../models/index";
import { RequestHandler } from "express";
const Solution_path = db.solution_paths;

export const find_path: RequestHandler = (req, res) => {
  const { id } = req.params;
  Solution_path.findById(id)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials.",
      });
    });
};

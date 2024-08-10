import { RequestHandler } from "express";
import { SolutionPath } from "models";

export const find_path: RequestHandler = (req, res) => {
  const { id } = req.params;
  SolutionPath.findById(id)
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

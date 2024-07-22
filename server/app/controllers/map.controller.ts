import db from "../models/index";
import { RequestHandler } from "express";
const Map = db.maps;

// Retrieve all Tutorials from the database.
export const findAll: RequestHandler = (req, res) => {
  Map.find({})
    .sort({ map_type: 1 })
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

// Find a single Tutorial with an id
export const findOne: RequestHandler = (req, res) => {
  const { id } = req.params;

  Map.findById(id)
    .then((data) => {
      if (!data)
        res.status(404).send({ message: `Not found Map with id ${id}` });
      else res.send(data);
    })
    .catch((err) => {
      res.status(500).send({ message: `Error retrieving Map with id=${id}` });
    });
};

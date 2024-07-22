import db from "../models/index";
const Scenario = db.scenarios;

// Retrieve all Tutorials from the database.
export const findAll = (req, res) => {
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

export const findByMap_id = (req, res) => {
  const id = req.params.id;
  Scenario.find({ map_id: id })
    .sort({ scen_type: 1 })
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

export const findByMap_id_Map_type = (req, res) => {
  const id = req.params.id;
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

export const findById = (req, res) => {
  const id = req.params.id;
  Scenario.find({ _id: id })
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

import fs from "fs";
import path from "path";
import db from "../models/index";
import { RequestHandler } from "express";

const OngoingSubmission = db.ongoing_submissions;
const Map = db.maps;
const Scenario = db.scenarios;
const SubmissionKey = db.submission_keys;

// find all submissions
export const findAll: RequestHandler = (req, res) => {
  OngoingSubmission.find({})
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message ||
          "Some error occurred while retrieving OngoingSubmission.",
      });
    });
};

// find a submission using id
export const findByInstance_id: RequestHandler = (req, res) => {
  const id = req.params.id;

  OngoingSubmission.find({ instance_id: id })
    .then((data) => {
      if (!data)
        res
          .status(404)
          .send({ message: "Not found OngoingSubmission with id " + id });
      else res.send(data);
    })
    .catch((err) => {
      res
        .status(500)
        .send({ message: "Error retrieving OngoingSubmission with id=" + id });
    });
};

// Find all OngoingSubmission entries with a given api_key
export const findByApiKey: RequestHandler = (req, res) => {
  const apiKey = req.params.apiKey;

  OngoingSubmission.find({ api_key: apiKey })
    .then((data) => {
      if (!data || data.length === 0) {
        res.status(404).send({
          message: "Not found OngoingSubmission with apiKey " + apiKey,
        });
      } else {
        res.send(data);
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error retrieving OngoingSubmission with apiKey=" + apiKey,
      });
    });
};

// create a new ongoing submission
export const create = async (req, res) => {
  // Define validation rules
  const validations = [
    { field: "api_key", message: "API key cannot be empty!" },
    { field: "agents", message: "Agents cannot be empty!" },
    { field: "lower_cost", message: "Lower cost cannot be empty!" },
    { field: "solution_cost", message: "Solution cost cannot be empty!" },
    { field: "map_name", message: "Map name cannot be empty!" },
    {
      field: "scen_type",
      message: "Scenario type (even or random)cannot be empty!",
    },
    { field: "type_id", message: "Type id cannot be empty!" },
    { field: "solution_path", message: "Solution path cannot be empty!" },
  ];

  // Iterate through validation rules ( ensure all parameters was defined)
  for (const validation of validations) {
    if (!req.body[validation.field]) {
      return res.status(400).send({ message: validation.message });
    }
  }
  // check api key
  const api = await SubmissionKey.findOne({ api_key: req.body.api_key }).catch(
    (err) => {
      res.status(400).send({
        message: err.message || "Some error occurred while finding api key.",
      });
    }
  );
  if (!api) {
    res.status(400).send({ message: "Error: map not found" });
    return;
  } else {
    // check if is expired
    const currentDate = new Date();
    if (currentDate > api.expirationDate) {
      // send error
      res.status(400).send({ message: "Error: api key is expired" });
      return;
    }
  }

  // check if the map exist and retrieve map id
  const map = await Map.findOne({ map_name: req.body.map_name }).catch(
    (err) => {
      res.status(400).send({
        message: err.message || "Some error occurred while finding map.",
      });
    }
  );
  if (!map) {
    res.status(400).send({ message: "Error: map not found" });
    return;
  }
  const map_id = map._id;

  // check if the scenario exist
  const scen = await Scenario.findOne({
    map_id: map_id,
    scen_type: req.body.scen_type,
    type_id: parseInt(req.body.type_id),
  }).catch((err) => {
    res.status(400).send({
      message: err.message || "Some error occurred while finding scenario.",
    });
  });
  if (!scen) {
    res.status(400).send({ message: "Error: scenario not found" });
    return;
  }
  const scen_id = scen._id;

  // chck if the solution_path consist invalid letters
  const solution_path = req.body.solution_path;
  // Regular expression to check if solution_path contains only 'l', 'r', 'u', 'd'
  const validPattern = /^[lrud]*$/;

  if (!validPattern.test(solution_path)) {
    return res.status(400).tson({
      error: "Invalid solution_path. Only letters l, r, u, d are allowed.",
    });
  }

  // create new ongoing submission data
  const new_ongoing_submission = new OngoingSubmission({
    api_key: req.body.api_key,
    map_id: map_id,
    scen_id: scen_id,
    agents: parseInt(req.body.agents),
    lower_cost: req.body.lower_cost,
    solution_cost: req.body.solution_cost,
    solution_path: solution_path,
    error: { isError: false, errorMessage: "" },
  });

  new_ongoing_submission
    .save(new_ongoing_submission)
    .then((data) => {
      res.send(data);
      console.log(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message ||
          "Some error occurred while creating the ongoing submission .",
      });
      console.log(err);
    });
};

// Function to get map information
const getMapInfo = (mapName: string): Promise<string> => {
  const filePath = path.join(__dirname, "resources", "maps", `${mapName}.map`);

  return new Promise((resolve, reject) => {
    // Check if the file exists
    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
        return reject(new Error(`Map file ${mapName}.map not found`));
      }

      // Read the map file
      fs.readFile(filePath, "utf8", (err, data) => {
        if (err) {
          return reject(err);
        }
        resolve(data); // Return the map data
      });
    });
  });
};

import { RequestHandler } from "express";
import mongoose from "mongoose";
import { SubmissionKey } from "models";
import crypto from "crypto";

export const findAll: RequestHandler = (req, res) => {
  SubmissionKey.find({})
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving requesters.",
      });
    });
};

export const findByRequestId: RequestHandler = (req, res) => {
  const requestId = req.params.request_id; // or req.query.request_id if it's a query parameter
  console.log(requestId);
  SubmissionKey.find({ request_id: requestId })
    .then((data) => {
      if (!data) {
        res.status(404).send({
          message: `No submission found with request_id ${requestId}`,
        });
      } else {
        res.send(data);
        console.log(data);
      }
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving the submission.",
      });
    });
};

export const findByApiKey: RequestHandler = (req, res) => {
  const { apiKey } = req.params; // Assuming apiKey is passed in req.params
  console.log("request api key : ", apiKey);
  SubmissionKey.findOne({ api_key: apiKey })
    .then((data) => {
      if (!data)
        res
          .status(404)
          .send({ message: `Not found SubmissionKey with apiKey ${apiKey}` });
      else {
        res.send(data);
        console.log("data for aubmission key is : ", data);
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: `Error retrieving SubmissionKey with apiKey=${apiKey}`,
      });
    });
};

export const create = async (req, res) => {
  if (!req.body.request_id) {
    return res.status(400).send({ message: "Request id cannot be empty!" });
  }
  const apiKey = crypto.randomBytes(16).toString("hex");
  const creationDate = new Date();
  const expirationDate = new Date();
  expirationDate.setMonth(expirationDate.getMonth() + 1); // API key valid for one month

  const submission_key = new SubmissionKey({
    request_id: req.body.request_id,
    api_key: apiKey,
    creationDate,
    expirationDate,
  });

  submission_key
    .save()
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Requester.",
      });
    });
};

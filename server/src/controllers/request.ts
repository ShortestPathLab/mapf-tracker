import { RequestHandler } from "express";
import mongoose from "mongoose";
import { Request, SubmissionKey } from "models";
import crypto from "crypto";

export const findAll: RequestHandler = (req, res) => {
  Request.find({})
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving request.",
      });
    });
};

export const findByInstance_id: RequestHandler = (req, res) => {
  const { id } = req.params;

  Request.findById(id)
    .then((data) => {
      if (!data)
        res.status(404).send({ message: `Not found request with id ${id}` });
      else res.send(data);
    })
    .catch((err) => {
      res
        .status(500)
        .send({ message: `Error retrieving request with id=${id}` });
    });
};

export const create = async (req, res) => {
  if (!req.body.requesterName) {
    return res
      .status(400)
      .send({ message: "Requester name can not be empty!" });
  }
  const request = new Request({
    requesterName: req.body.requesterName,
    requesterEmail: req.body.requesterEmail,
    requesterAffilation: req.body.requesterAffilation,
    googleScholar: req.body.googleScholar,
    dblp: req.body.dblp,
    justification: req.body.justification,
    algorithmName: req.body.algorithmName,
    authorName: req.body.authorName,
    paperReference: req.body.paperReference,
    githubLink: req.body.githubLink,
    comments: req.body.comments,
  });

  request
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

export const updateRequest = async (req, res) => {
  const { id } = req.params;
  const { reviewStatus, ...otherFields } = req.body;
  try {
    const request = await Request.findById(id);
    console.log(request);
    if (!request) {
      return res
        .status(404)
        .send({ message: `Request with id ${id} not found` });
    }

    const previousStatus = request.reviewStatus.status;

    const updatedRequest = await Request.findByIdAndUpdate(
      id,
      { reviewStatus, ...otherFields },
      { new: true }
    );

    // request was reviewed and approved
    if (
      previousStatus === "not-reviewed" &&
      reviewStatus.status === "approved"
    ) {
      console.log("innnnnn here");
      // generate new submission key api for the user
      const apiKey = crypto.randomBytes(16).toString("hex");
      const creationDate = new Date();
      const expirationDate = new Date();
      expirationDate.setMonth(expirationDate.getMonth() + 1); // API key valid for one month
      const submission_key = new SubmissionKey({
        request_id: id,
        api_key: apiKey,
        creationDate,
        expirationDate,
      });

      submission_key.save().catch((err) => {
        res.status(500).send({
          message:
            err.message ||
            "Some error occurred while creating the submission key.",
        });
      });
    }
    res.send({ message: "Request updated successfully", updatedRequest });
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while updating the request.",
    });
  }
};

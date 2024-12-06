import { RequestHandler } from "express";
import mongoose from "mongoose";
import { Infer, Request, SubmissionKey } from "models";
import crypto from "crypto";
import RequestConfirmation from "emails/RequestConfirmation";
import { log } from "logging";
import { render } from "@react-email/components";
import React from "react";
import { mail } from "mail";

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

export const findByKey: RequestHandler = async (req, res) => {
  const { key } = req.params;
  const { request_id } = await SubmissionKey.findOne({ api_key: key });
  res.json(await Request.findById(request_id));
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

async function queueMail(args: Infer<typeof Request>) {
  log.info("Preparing mail", args);
  const a = await render(<RequestConfirmation {...args} />);
  log.info(a);
  mail(
    "noreply@pathfinding.ai",
    args.requesterEmail,
    "We have received your request",
    a
  );
}

export const create = async (req, res) => {
  if (!req.body.requesterName) {
    return res
      .status(400)
      .send({ message: "Requester name can not be empty!" });
  }

  const obj = {
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
  };

  const request = new Request(obj);
  try {
    const data = await request.save();
    await queueMail(obj as Infer<typeof Request>);
    res.send(data);
  } catch (err) {
    res.status(500).send({
      message:
        err.message || "Some error occurred while creating the Requester.",
    });
  }
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

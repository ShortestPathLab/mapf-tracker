import { RequestHandler } from "express";
import { mail } from "mail";
import { Types } from "mongoose";
import { render } from "@react-email/components";
import { randomBytes } from "crypto";
import { addMonths, format } from "date-fns";
import ReviewOutcome from "emails/ReviewOutcome";
import { log } from "logging";
import {
  Algorithm,
  Instance,
  Map,
  Request,
  Scenario,
  SolutionPath,
  Submission,
  SubmissionKey,
} from "models";
import React from "react";
import z from "zod";
import { assert } from "utils/assert";

const titles = {
  approved: "Your submission (API) key for MAPF Tracker",
  "not-reviewed": "Your submission request status for MAPF Tracker",
  rejected: "Your submission request for MAPF Tracker was rejected",
};

async function queueMail({
  apiKey,
  requesterEmail,
  requesterName,
  status,
  comments,
}: {
  apiKey: string;
  requestId: string;
  requesterEmail: string;
  requesterName?: string;
  status: "approved" | "not-reviewed" | "rejected";
  comments?: string;
}) {
  log.info("Preparing mail", { apiKey, requesterEmail });
  mail(
    "noreply@pathfinding.ai",
    requesterEmail,
    titles[status],
    await render(
      <ReviewOutcome
        apiKey={apiKey}
        status={status}
        name={requesterName}
        comments={comments}
      />,
      { pretty: true }
    )
  );
}

export const createKeyAndSendMail: RequestHandler<
  unknown,
  unknown,
  { requestId: string }
> = async (req, res) => {
  const { requestId } = z.object({ requestId: z.string() }).parse(req.body);
  const doc = await Request.findById(requestId);
  assert(doc, "Request must be defined");
  const {
    requesterEmail,
    requesterName,
    reviewStatus: { comments, status },
  } = doc;
  assert(requesterEmail, "Requester email must be defined");
  const apiKey = await createSubmissionKey(requestId);
  log.info("Sending mail");
  await queueMail({
    apiKey,
    requestId,
    requesterEmail,
    requesterName,
    comments,
    status,
  });
  res.json({ success: true });
};

export const findSubmittedAlgoByID: RequestHandler = (req, res) => {
  const { id } = req.params;
  Algorithm.find({ user_id: id }, {})
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

export async function createSubmissionKey(requestId: string) {
  log.info("Creating API key");
  const apiKey = randomBytes(16).toString("hex");
  const creationDate = new Date();
  const expirationDate = addMonths(creationDate, 1);
  await new SubmissionKey({
    request_id: requestId,
    creationDate,
    expirationDate,
    api_key: apiKey,
  }).save();
  return apiKey;
}

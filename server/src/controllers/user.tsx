import type { Context } from "elysia";
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

export const createKeyAndSendMail = async ({ body }: Context) => {
  const { requestId } = z.object({ requestId: z.string() }).parse(body);
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
  return { success: true };
};

export const findSubmittedAlgoByID = async ({ params }: Context) =>
  Algorithm.find({ user_id: params.id }, {});

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

import { render } from "@react-email/components";
import { requireAuth } from "auth";
import { password } from "bun";
import type { Context } from "elysia";
import { Elysia } from "elysia";
import ReviewOutcome from "emails/ReviewOutcome";
import { log } from "logging";
import { mail } from "mail";
import { Request, User } from "models";
import { Types } from "mongoose";
import React from "react";
import { assert } from "utils/assert";
import { createSubmissionKey } from "utils/submissionKey";
import z from "zod";

const { hash } = password;

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

const createKeyAndSendMail = async ({ body }: Context) => {
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

// The whole /api/user surface requires auth. The basic CRUD is inlined here
// (rather than `users.basic()`) because its `/write` hashes the password.
export const userRoutes = new Elysia({ prefix: "/api/user" }).guard(
  { beforeHandle: requireAuth },
  (app) =>
    app.post("/notify", createKeyAndSendMail).group("/basic", (basic) =>
      basic
        .get("/", () => User.find())
        .get("/:id", ({ params }) => User.findById(params.id))
        .post("/write", async ({ body }) => {
          const { username, password: pw, id } = body as {
            username: string;
            password: string;
            id?: string;
          };
          const result = await User.findOneAndUpdate(
            { _id: id ?? new Types.ObjectId() },
            { $set: { username, hash: await hash(pw) } },
            { upsert: true },
          );
          return { id: result?.id?.toString?.() };
        })
        .post("/delete", async ({ body }) => {
          const { id } = body as { id?: string };
          await User.findByIdAndDelete(id);
          return { id };
        }),
    ),
);

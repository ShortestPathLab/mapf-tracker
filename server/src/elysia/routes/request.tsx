import { render } from "@react-email/components";
import { requireAuth } from "auth";
import type { Context } from "elysia";
import { Elysia, status } from "elysia";
import RequestConfirmation from "emails/RequestConfirmation";
import { log } from "logging";
import { mail } from "mail";
import { Infer, Request, SubmissionKey, requests } from "models";
import React from "react";
import { assert } from "utils/assert";
import { allToJSON, toJSON } from "utils/toJSON";
import { z } from "zod";

const findByEmail = async ({ params }: Context) =>
  Request.find({ requesterEmail: params.email }).then(allToJSON);

const findAll = async () => Request.find({});

const findByKey = async ({ params }: Context) => {
  const { request_id } = (await SubmissionKey.findOne({ api_key: params.key })) ?? {};
  if (!request_id)
    return status(404, {
      message: `No request linked to key ${params.key}`,
    });
  const data = await Request.findById(request_id);
  if (!data)
    return status(404, {
      message: `Not found request with id ${request_id}`,
    });
  return toJSON(data);
};

const findByInstance_id = async ({ params }: Context) => {
  const data = await Request.findById(params.id);
  if (!data) return status(404, { message: `Not found request with id ${params.id}` });
  return data.toJSON();
};

async function queueMail(args: Infer<typeof Request>) {
  log.info("Preparing mail", args);
  assert(args.requesterEmail, "Requester email must be defined");
  const a = await render(<RequestConfirmation {...args} />, { pretty: true });
  mail("noreply@pathfinding.ai", args.requesterEmail, "We have received your request", a);
}

const create = async ({ body }: Context) => {
  const b = body as Record<string, unknown>;
  if (!b.requesterName) {
    return status(400, { message: "Requester name can not be empty!" });
  }

  const field = {
    isOptimal: b.isOptimal,
    requesterName: b.requesterName,
    requesterEmail: b.requesterEmail,
    requesterAffiliation: b.requesterAffiliation,
    googleScholar: b.googleScholar,
    dblp: b.dblp,
    justification: b.justification,
    algorithmName: b.algorithmName,
    authorName: b.authorName,
    paperReference: b.paperReference,
    githubLink: b.githubLink,
    comments: b.comments,
  };

  const request = new Request(field);
  const data = await request.save();
  await queueMail(field as Infer<typeof Request>);
  return data.toJSON();
};

const requestSchema = {
  id: z.string(),
  isOptimal: z.boolean(),
  requesterName: z.string(),
  requesterEmail: z.string().email(),
  requesterAffiliation: z.string(),
  googleScholar: z.string().optional(),
  dblp: z.string().optional(),
  justification: z.string().optional(),
  algorithmName: z.string(),
  authorName: z.string(),
  paperReference: z.string().optional(),
  githubLink: z.string().optional(),
  comments: z.string().optional(),
};

const handleRequestUpdate = async ({ id, ...data }: z.infer<z.ZodObject<typeof requestSchema>>) => {
  const request = Request.findById(id);
  if (!request) throw new Error("Request not found");
  await request.updateOne(data);
  return { id };
};

const updateRequest = async ({ body }: Context) =>
  handleRequestUpdate(z.object(requestSchema).parse(body));

const updateRequestElevated = async ({ body }: Context) =>
  handleRequestUpdate(body as z.infer<z.ZodObject<typeof requestSchema>>);

export const requestRoutes = new Elysia({ prefix: "/api/request" })
  .get("/", findAll, { beforeHandle: requireAuth })
  .get("/key/:key", findByKey)
  .get("/id/:id", findByInstance_id)
  .get("/email/:email", findByEmail)
  .post("/create", create)
  .post("/update/:id", updateRequest)
  .post("/updateElevated/:id", updateRequestElevated, {
    beforeHandle: requireAuth,
  })
  .group("/basic", (app) => app.use(requests.basic(requireAuth)));

import { render } from "@react-email/components";
import type { Context } from "elysia";
import { status } from "elysia";
import RequestConfirmation from "emails/RequestConfirmation";
import { log } from "logging";
import { mail } from "mail";
import { Infer, Request, SubmissionKey } from "models";
import { queryClient } from "query";
import React from "react";
import { assert } from "utils/assert";
import { z } from "zod";

const { query } = queryClient(Request);

export const findByEmail = query(({ params }) => [
  { requesterEmail: params.email },
]);

export const findAll = async () => Request.find({});

export const findByKey = async ({ params }: Context) => {
  const { request_id } =
    (await SubmissionKey.findOne({ api_key: params.key })) ?? {};
  if (!request_id) return undefined;
  return (await Request.findById(request_id))?.toJSON();
};

export const findByInstance_id = async ({ params }: Context) => {
  const data = await Request.findById(params.id);
  if (!data) return status(404, { message: `Not found request with id ${params.id}` });
  return data.toJSON();
};

async function queueMail(args: Infer<typeof Request>) {
  log.info("Preparing mail", args);
  assert(args.requesterEmail, "Requester email must be defined");
  const a = await render(<RequestConfirmation {...args} />, { pretty: true });
  mail(
    "noreply@pathfinding.ai",
    args.requesterEmail,
    "We have received your request",
    a,
  );
}

export const create = async ({ body }: Context) => {
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

const handleRequestUpdate = async ({
  id,
  ...data
}: z.infer<z.ZodObject<typeof requestSchema>>) => {
  const request = Request.findById(id);
  if (!request) throw new Error("Request not found");
  await request.updateOne(data);
  return { id };
};

export const updateRequest = async ({ body }: Context) =>
  handleRequestUpdate(z.object(requestSchema).parse(body));

export const updateRequestElevated = async ({ body }: Context) =>
  handleRequestUpdate(body as z.infer<z.ZodObject<typeof requestSchema>>);

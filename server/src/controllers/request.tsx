import { render } from "@react-email/components";
import RequestConfirmation from "emails/RequestConfirmation";
import { RequestHandler } from "express";
import { log } from "logging";
import { mail } from "mail";
import { Infer, Request, SubmissionKey } from "models";
import { queryClient, route } from "query";
import React from "react";
import { z } from "zod";

const { query } = queryClient(Request);

export const findByEmail = query(
  z.object({ email: z.string() }),
  ({ email }) => [
    {
      requesterEmail: email,
    },
  ]
);

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
  const { request_id } = (await SubmissionKey.findOne({ api_key: key })) ?? {};
  if (!request_id) return res.json(undefined);
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
  const a = await render(<RequestConfirmation {...args} />, { pretty: true });
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
    requesterAffiliation: req.body.requesterAffiliation,
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

const requestSchema = {
  id: z.string(),
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

export const updateRequest = route(
  z.object(requestSchema),
  handleRequestUpdate
);

export const updateRequestElevated = route(z.any(), handleRequestUpdate);

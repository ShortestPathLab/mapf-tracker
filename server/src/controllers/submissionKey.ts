import { RequestHandler } from "express";
import { SubmissionKey } from "models";
import { createSubmissionKey } from "./user";
import { route } from "query";
import { z } from "zod";

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

export const findByApiKey: RequestHandler = (req, res) => {
  const { apiKey } = req.params; // Assuming apiKey is passed in req.params
  /**/ SubmissionKey.findOne({ api_key: apiKey })
    .then((data) => {
      if (!data)
        res
          .status(404)
          .send({ message: `Not found SubmissionKey with apiKey ${apiKey}` });
      else {
        res.send(data);
        /**/
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: `Error retrieving SubmissionKey with apiKey=${apiKey}`,
      });
    });
};

export const create = route(
  z.object({
    request: z.string(),
  }),
  async ({ request }) => {
    const key = await createSubmissionKey(request);
    return { key };
  },
  { source: "params" }
);

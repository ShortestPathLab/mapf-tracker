import { RequestHandler } from "express";
import { Instance, Map, Scenario } from "models";
import { cached, route } from "query";
import z from "zod";
import { createPreviewAsync } from "./createPreview.worker";

export const preview: RequestHandler = cached(
  [Map, Scenario, Instance],
  z.object({
    map: z.string().optional(),
    instance: z.string().optional(),
    scenario: z.string().optional(),
  }),
  async (data) => await createPreviewAsync(data),
  "body"
);

export const findAll: RequestHandler = (req, res) => {
  Map.find({})
    .sort({ map_type: 1 })
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

export const findOne: RequestHandler = (req, res) => {
  const { id } = req.params;

  Map.findById(id)
    .then((data) => {
      if (!data)
        res.status(404).send({ message: `Not found Map with id ${id}` });
      else res.send(data);
    })
    .catch((err) => {
      res.status(500).send({ message: `Error retrieving Map with id=${id}` });
    });
};

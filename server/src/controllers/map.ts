import { RequestHandler } from "express";
import { Instance, Map, SolutionPath } from "models";
import { cached, route } from "query";
import z from "zod";
import { handler as createPreviewAsync } from "./createPreview.worker";
import { getSolutionPath } from "./solutionPath";

export const preview: RequestHandler = route(
  z.object({
    map: z.string().optional(),
    instance: z.string().optional(),
    scenario: z.string().optional(),
  }),
  createPreviewAsync,
  { source: "body" }
);

export const makespan: RequestHandler = cached(
  [Instance, SolutionPath],
  z.object({
    instance: z.string().optional(),
    solutionPath: z.string().optional(),
  }),
  async ({ instance, solutionPath }) => {
    const id = solutionPath ?? instance;
    if (!id) return null;
    const paths = await getSolutionPath(id, "submitted");
    if (!paths) return null;
    return Math.max(0, ...paths.map((path) => path.replace(/\r$/, "").length));
  },
  "body",
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

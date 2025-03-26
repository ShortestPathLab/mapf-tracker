import { Application, Router } from "express";
import { last } from "lodash";
import { Instance } from "models";
import { route } from "query";
import { z } from "zod";
import { getSolutionPath } from "./solutionPath";

export const use = (app: Application, path = "/api/bulk") =>
  app.use(
    path,
    Router().post(
      "/results",
      route(
        z.object({
          scenario: z.string(),
          solutions: z.boolean().optional().default(false),
        }),
        async ({ scenario: id, solutions }) => {
          const instances = await Instance.find({ scen_id: id });
          return await Promise.all(
            instances.map(async (instance) => {
              const { solution_algos, solution_path_id } = instance;
              const id =
                solution_path_id?.toString() ??
                last(solution_algos)?.submission_id?.toString();
              return {
                ...instance.toJSON(),
                ...(id && solutions
                  ? { solution: await getSolutionPath(id, "submitted") }
                  : {}),
              };
            })
          );
        },
        { source: "body" }
      )
    )
  );

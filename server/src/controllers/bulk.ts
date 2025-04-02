import { Application, Router } from "express";
import { last, pick, thru } from "lodash";
import { Instance, Map, Scenario } from "models";
import { route } from "query";
import { z } from "zod";
import { getSolutionPath } from "./solutionPath";
import { encode } from "validator";

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
          const scenario = await Scenario.findById(id);
          const map = await Map.findById(scenario!.map_id);
          return await Promise.all(
            instances.map(async (instance) => {
              const { solution_algos, solution_path_id } = instance;
              const id =
                solution_path_id?.toString() ??
                last(solution_algos)?.submission_id?.toString();
              return {
                map_name: map!.map_name,
                scen_type: scenario!.scen_type,
                type_id: scenario!.type_id,
                ...pick(
                  instance.toJSON(),
                  "agents",
                  "lower_cost",
                  "solution_cost"
                ),
                ...(id && solutions
                  ? {
                      flip_up_down: true,
                      solution_plan: thru(
                        await getSolutionPath(id, "submitted"),
                        (p) => p?.map?.(encode).join("\n")
                      ),
                    }
                  : {}),
              };
            })
          );
        },
        { source: "body" }
      )
    )
  );

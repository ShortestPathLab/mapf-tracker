import type { Context } from "elysia";
import { Elysia } from "elysia";
import { getSolutionPath } from "utils/solutionPath";
import { z } from "zod";

const findPath = async ({ params }: Context) => {
  const { id, source } = z
    .object({
      id: z.string(),
      source: z.enum(["ongoing", "submitted"]).default("submitted"),
    })
    .parse(params);
  return getSolutionPath(id, source);
};

export const solutionPathRoutes = new Elysia({ prefix: "/api/solution_path" })
  .get("/:source/:id", findPath);

import { Elysia } from "elysia";
import { getSolutionPath } from "utils/solutionPath";
import { z } from "zod";

export const solutionPathRoutes = new Elysia({
  prefix: "/api/solutionPath",
}).get("/:source/:id", async ({ params }) => {
  const { id, source } = z
    .object({
      id: z.string(),
      source: z.enum(["ongoing", "submitted"]).default("submitted"),
    })
    .parse(params);
  // Default to an empty path list so the response type stays `string[]`
  // (returning `undefined` collapses Eden's inference to `unknown`).
  return (await getSolutionPath(id, source)) ?? [];
});

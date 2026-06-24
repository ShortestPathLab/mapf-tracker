import type { Context } from "elysia";
import { Instance, SolutionPath } from "models";
import { cached } from "query";
import z from "zod";
import { handler as createPreviewAsync } from "./createPreview.worker";
import { getSolutionPath } from "./solutionPath";

export const preview = async ({ body }: Context) =>
  createPreviewAsync!(
    z
      .object({
        map: z.string().optional(),
        instance: z.string().optional(),
        scenario: z.string().optional(),
      })
      .parse(body),
  );

export const makespan = cached(
  async ({ body }: Context) => {
    const { instance, solutionPath } = (body ?? {}) as {
      instance?: string;
      solutionPath?: string;
    };
    const id = solutionPath ?? instance;
    if (!id) return null;
    const paths = await getSolutionPath(id, "submitted");
    if (!paths) return null;
    return Math.max(0, ...paths.map((path) => path.replace(/\r$/, "").length));
  },
  { watch: [Instance, SolutionPath], cacheKey: (ctx) => ctx.body },
);

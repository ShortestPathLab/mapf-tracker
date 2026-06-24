import { Elysia } from "elysia";
import { z } from "zod";
import { handler as bulkAsync } from "../../controllers/bulk.worker";

const schema = z.object({
  scenario: z.string(),
  solutions: z.boolean().optional().default(false),
  skip: z.number().default(0),
  limit: z.number().default(Infinity),
});

export const bulkRoutes = new Elysia({ prefix: "/api/bulk" }).post(
  "/results",
  async ({ body }) => bulkAsync!(schema.parse(body)),
);

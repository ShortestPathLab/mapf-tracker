import { Elysia } from "elysia";
import { requireAuth } from "auth";
import { submissionKeys } from "models";
import * as submissionKey from "../../controllers/submissionKey";

// Static `/create` and `/basic` registered before the dynamic `/:apiKey`.
export const submissionKeyRoutes = new Elysia({ prefix: "/api/submission_key" })
  .get("/", submissionKey.findAll)
  .post("/create/:request", submissionKey.create, { beforeHandle: requireAuth })
  .group("/basic", (app) => app.use(submissionKeys.basic(requireAuth)))
  .get("/:apiKey", submissionKey.findByApiKey);

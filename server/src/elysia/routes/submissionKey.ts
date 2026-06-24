import { requireAuth } from "auth";
import type { Context } from "elysia";
import { Elysia, status } from "elysia";
import { SubmissionKey, submissionKeys } from "models";
import { createSubmissionKey } from "utils/submissionKey";

const findAll = async () => SubmissionKey.find({});

const findByApiKey = async ({ params }: Context) => {
  const data = await SubmissionKey.findOne({ api_key: params.apiKey });
  if (!data)
    return status(404, {
      message: `Not found SubmissionKey with apiKey ${params.apiKey}`,
    });
  return data.toJSON();
};

const create = async ({ params }: Context) => {
  const key = await createSubmissionKey(params.request);
  return { key };
};

// Static `/create` and `/basic` registered before the dynamic `/:apiKey`.
export const submissionKeyRoutes = new Elysia({ prefix: "/api/submission_key" })
  .get("/", findAll)
  .post("/create/:request", create, { beforeHandle: requireAuth })
  .group("/basic", (app) => app.use(submissionKeys.basic(requireAuth)))
  .get("/:apiKey", findByApiKey);

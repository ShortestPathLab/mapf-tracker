import { requireAuth } from "auth";
import type { Context } from "elysia";
import { Elysia, status } from "elysia";
import { SubmissionKey, submissionKeys } from "models";
import { createSubmissionKey } from "utils/submissionKey";
import { allToJSON, toJSON } from "utils/toJSON";

const findAll = async () => SubmissionKey.find({}).then(allToJSON);

const findByApiKey = async ({ params }: Context) => {
  const data = await SubmissionKey.findOne({ api_key: params.apiKey });
  if (!data)
    return status(404, {
      message: `Not found SubmissionKey with apiKey ${params.apiKey}`,
    });
  return toJSON(data);
};

const create = async ({ params }: Context) => {
  const key = await createSubmissionKey(params.request);
  return { key };
};

// Static `/request` and `/basic` registered before the dynamic `/:apiKey`.
export const submissionKeyRoutes = new Elysia({ prefix: "/api/submissionKey" })
  .get("/", findAll)
  .post("/request/:request", create, { beforeHandle: requireAuth })
  .group("/basic", (app) => app.use(submissionKeys.basic(requireAuth)))
  .get("/:apiKey", findByApiKey);

import type { Context } from "elysia";
import { status } from "elysia";
import { SubmissionKey } from "models";
import { createSubmissionKey } from "./user";

export const findAll = async () => SubmissionKey.find({});

export const findByApiKey = async ({ params }: Context) => {
  const data = await SubmissionKey.findOne({ api_key: params.apiKey });
  if (!data)
    return status(404, {
      message: `Not found SubmissionKey with apiKey ${params.apiKey}`,
    });
  return data.toJSON();
};

export const create = async ({ params }: Context) => {
  const key = await createSubmissionKey(params.request);
  return { key };
};

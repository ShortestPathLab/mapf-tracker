import { model as createModel } from "mongoose";
import { createSchema } from "./createSchema";
import { queryClient } from "query";

const schema = createSchema({
  username: { type: String, index: true, unique: true },
  password: String,
  hash: String,
});

export const model = createModel("User", schema);

export const query = queryClient(model);

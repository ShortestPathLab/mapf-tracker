import { model as createModel } from "mongoose";
import { createSchema } from "./createSchema";

const schema = createSchema({
  username: String,
  password: String,
});

export const model = createModel("User", schema);

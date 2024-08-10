import { Schema, model as createModel } from "mongoose";

const schema = new Schema({
  username: String,
  password: String,
});

export const model = createModel("User", schema);

import { Schema, model as createModel } from "mongoose";
import { createSchema } from "./createSchema";

const schema = createSchema({ solutions: [String] });

export const model = createModel("ongoing_submission_solution", schema);

import { Schema, model as createModel } from "mongoose";
import { createSchema } from "./createSchema";

const schema = createSchema(
  {
    map_id: { type: Schema.Types.ObjectId, ref: "map" },
    instance_id: { type: Schema.Types.ObjectId, ref: "instance", index: true },
    algo_id: { type: Schema.Types.ObjectId, ref: "algorithm", index: true },
    lower_cost: Number,
    solution_cost: Number,
    best_lower: Boolean,
    best_solution: Boolean,
    date: String,
    scen_id: { type: Schema.Types.ObjectId, ref: "scenario" },
    agents: Number,
  },
  { versionKey: false }
);

schema.index(
  { algo_id: 1, map_id: 1, scen_id: 1, agents: 1 },
  { unique: true }
);

export const model = createModel("submission", schema);

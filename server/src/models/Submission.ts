import { Schema, model as createModel } from "mongoose";

const schema = new Schema(
  {
    map_id: { type: Schema.Types.ObjectId, ref: "map" },
    instance_id: { type: Schema.Types.ObjectId, ref: "instance" },
    algo_id: { type: Schema.Types.ObjectId, ref: "algorithm" },
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

export const model = createModel("submission", schema);

import { Schema, model as createModel } from "mongoose";
import { createSchema } from "./createSchema";
const schema = createSchema({
  map_id: { type: Schema.Types.ObjectId, ref: "map" },
  scen_id: { type: Schema.Types.ObjectId, ref: "scenario", index: true },
  agents: Number,

  lower_cost: Number,
  lower_algos: [
    {
      algo_id: { type: Schema.Types.ObjectId, ref: "algorithm" },
      date: String,
      value: Number,
    },
  ],
  lower_date: String,

  solution_cost: Number,
  solution_algos: [
    {
      algo_name: String,
      algo_id: { type: Schema.Types.ObjectId, ref: "algorithm" },
      date: String,
      value: Number,
    },
  ],
  solution_date: String,
  closed: Boolean,
  empty: Boolean,
  solution_path_id: {
    type: Schema.Types.ObjectId,
    ref: "solution_path",
  },
});

schema.index({ map_id: 1, scen_id: 1, agents: 1 }, { unique: true });

export const model = createModel("instance", schema);

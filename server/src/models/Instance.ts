import { Schema, model as createModel } from "mongoose";
import { createSchema } from "./createSchema";

const schema = createSchema({
  map_id: { type: Schema.Types.ObjectId, ref: "map" },
  scen_id: { type: Schema.Types.ObjectId, ref: "scenario" },
  agents: Number,

  lower_cost: Number,
  lower_algos: [
    {
      algo_name: String,
      algo_id: { type: Schema.Types.ObjectId, ref: "algorithm" },
      date: String,
    },
  ],
  lower_date: String,

  solution_cost: Number,
  solution_algos: [
    {
      algo_name: String,
      algo_id: { type: Schema.Types.ObjectId, ref: "algorithm" },
      date: String,
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

export const model = createModel("instance", schema);

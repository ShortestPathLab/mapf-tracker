import { Schema, model as createModel } from "mongoose";
import { createSchema } from "./createSchema";
import { queryClient } from "query";
const schema = createSchema({
  map_id: { type: Schema.Types.ObjectId, ref: "map", index: true },
  scen_id: { type: Schema.Types.ObjectId, ref: "scenario", index: true },
  agents: { type: Number, index: "asc" },
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
      submission_id: { type: Schema.Types.ObjectId, ref: "submission" },
      value: Number,
    },
  ],
  /**
   * @deprecated
   */
  solution_date: { index: 1, type: String },
  /**
   * @deprecated
   */
  closed: Boolean,
  /**
   * @deprecated
   */
  empty: { type: Boolean, index: true },
  /**
   * @deprecated
   */
  solution_path_id: {
    type: Schema.Types.ObjectId,
    ref: "solution_path",
  },
});

schema.index({ map_id: 1, scen_id: 1, agents: 1 }, { unique: true });

schema.index({ "solution_algos.date": 1 });

schema.index({ "lower_algos.date": 1 });

schema.index({ "solution_algos.0.date": 1 }, { sparse: true });

schema.index({ "lower_algos.0.date": 1 }, { sparse: true });

export const model = createModel("instance", schema);

export const query = queryClient(model);

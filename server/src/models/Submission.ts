import { Schema, model as createModel } from "mongoose";
import { createSchema } from "./createSchema";
import { queryClient } from "query";

const schema = createSchema(
  {
    map_id: { type: Schema.Types.ObjectId, ref: "map", index: true },
    instance_id: { type: Schema.Types.ObjectId, ref: "instance", index: true },
    algo_id: { type: Schema.Types.ObjectId, ref: "algorithm", index: true },
    lower_cost: { type: Number, index: "asc" },
    solution_cost: { type: Number, index: "asc" },
    /**
     * @deprecated
     */
    best_lower: Boolean,
    /**
     * @deprecated
     */
    best_solution: Boolean,
    solutions: [String],
    date: { type: Date, index: true },
    scen_id: { type: Schema.Types.ObjectId, ref: "scenario", index: true },
    agents: { type: Number, index: "asc" },
  },
  { versionKey: false }
);

schema.index(
  { algo_id: 1, map_id: 1, scen_id: 1, agents: 1 },
  { unique: true }
);
schema.index(
  { map_id: 1, scen_id: 1, agents: 1, solution_cost: 1 },
  { unique: false }
);

schema.index({ instance_id: 1, solution_cost: 1 }, { unique: false });

export const model = createModel("submission", schema);

export const query = queryClient(model);

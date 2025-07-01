import { Schema, model as createModel } from "mongoose";
import { createSchema } from "./createSchema";

const schema = createSchema({
  map_id: { type: Schema.Types.ObjectId, ref: "map" },
  type_id: { type: Number, index: true },
  scen_type: { type: String, index: true },
  // ─── Computed ────────────────────────────────────────────────────────
  map_name: { type: String, index: true },
  map_type: { type: String, index: true },
  // ─────────────────────────────────────────────────────────────────────
  instances: Number,
  instances_closed: Number,
  instances_solved: Number,
});

schema.index({ map_id: 1, type_id: 1, scen_type: 1 }, { unique: true });

export const model = createModel("scenario", schema);

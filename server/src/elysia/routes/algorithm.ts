import { Elysia } from "elysia";
import { Algorithm } from "models";
import { allToJSON } from "utils/toJSON";

// The bespoke best/closed/solved/lower aggregations that used to live here
// (per map / domain / scenario / agent) are now served by the canonical
// /api/queries/aggregate/algorithm endpoint; the client fans out one call per
// algorithm and combines client-side. See queries.ts.
export const algorithmRoutes = new Elysia({ prefix: "/api/algorithm" })
  .get("/", () => Algorithm.find({}, { _id: 1, algo_name: 1 }).then(allToJSON))
  .get("/all_detail", () => Algorithm.find().then(allToJSON));

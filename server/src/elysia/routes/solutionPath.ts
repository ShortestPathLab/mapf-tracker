import { Elysia } from "elysia";
import { findPath } from "../../controllers/solutionPath";

export const solutionPathRoutes = new Elysia({ prefix: "/api/solution_path" })
  .get("/:source/:id", findPath);

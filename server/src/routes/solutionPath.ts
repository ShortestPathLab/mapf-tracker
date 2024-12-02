import { Router, Application } from "express";
import * as solution_path from "../controllers/solutionPath";

export default (app: Application) => {
  const router = Router();
  router.get("/:source/:id", solution_path.findPath);
  app.use("/api/solution_path", router);
};

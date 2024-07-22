import { Router } from "express";
import * as ongoing_submission from "../controllers/ongoing_submission.controller";

export default (app) => {
  const router = Router();
  router.get("/", ongoing_submission.findAll);
  router.get("/:id", ongoing_submission.findByInstance_id);
  router.get("/:api_key", ongoing_submission.findByApiKey);
  router.post("/create", ongoing_submission.create);

  app.use("/api/ongoing_submission", router);
};

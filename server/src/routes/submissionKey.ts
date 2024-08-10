import { Router } from "express";
import * as submission_key from "../controllers/submissionKey";

export default (app) => {
  const router = Router();
  router.get("/", submission_key.findAll);
  router.get("/:apiKey", submission_key.findByApiKey);
  router.post("/create", submission_key.create);
  router.get("/find/:request_id", submission_key.findByRequestId);

  app.use("/api/submission_key", router);
};

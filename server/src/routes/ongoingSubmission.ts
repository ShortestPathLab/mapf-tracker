import { Application, Router } from "express";
import {
  create,
  findAll,
  findByApiKey,
  findById,
  deleteById,
  finalise,
  status,
  deleteByApiKey,
  summaryByApiKey,
  findByScenario,
  statusByApiKey,
} from "../controllers/ongoingSubmission";

export default (app: Application) => {
  const router = Router();
  router.get("/", findAll);
  router.get("/id/:id", findById);
  router.post("/delete", deleteById);
  router.get("/status/:apiKey", statusByApiKey);
  router.delete("/:apiKey", deleteByApiKey);
  router.get("/summary/:apiKey/:page?", summaryByApiKey);
  router.get("/:apiKey", findByApiKey);
  router.get("/scenario/:apiKey/:scenario", findByScenario);
  router.get("/finalise/:key", finalise);
  router.post("/create/:apiKey/:label?", create);
  router.post("/status", status);
  app.use("/api/ongoing_submission", router);
};

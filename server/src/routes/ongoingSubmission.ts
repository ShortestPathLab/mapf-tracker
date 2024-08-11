import { Application, Router } from "express";
import {
  create,
  findAll,
  findByApiKey,
  findById,
  deleteById,
} from "../controllers/ongoingSubmission";

export default (app: Application) => {
  const router = Router();
  router.get("/", findAll);
  router.get("/id/:id", findById);
  router.delete("/id/:id", deleteById);
  router.get("/:apiKey", findByApiKey);
  router.post("/create", create);

  app.use("/api/ongoing_submission", router);
};

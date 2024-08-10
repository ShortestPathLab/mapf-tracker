import { Application, Router } from "express";
import {
  create,
  findAll,
  findByApiKey,
  findById,
} from "../controllers/ongoingSubmission";

export default (app: Application) => {
  const router = Router();
  router.get("/", findAll);
  router.get("/id/:id", findById);
  router.get("/:apiKey", findByApiKey);
  router.post("/create", create);

  app.use("/api/ongoing_submission", router);
};

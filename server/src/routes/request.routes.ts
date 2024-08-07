import { Router } from "express";
import * as request from "../controllers/request.controller";

export default (app) => {
  const router = Router();
  router.get("/", request.findAll);
  router.get("/id/:id", request.findByInstance_id);
  router.post("/create", request.create);
  router.post("/update/:id", request.updateRequest);

  app.use("/api/request", router);
};

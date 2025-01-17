import { Router, Application } from "express";
import * as request from "../controllers/request";

export default (app: Application) => {
  const router = Router();
  router.get("/", request.findAll);
  router.get("/key/:key", request.findByKey);
  router.get("/id/:id", request.findByInstance_id);
  router.post("/create", request.create);
  router.post("/update/:id", request.updateRequest);
  router.get("/email/:email", request.findByEmail);
  app.use("/api/request", router);
};

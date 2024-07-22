import { Router } from "express";
import * as request from "../controllers/request.controller";

export default (app) => {
  const router = Router();
  // Retrieve all requester
  router.get("/", request.findAll);
  // Retrieve a single requester with id
  router.get("/id/:id", request.findByInstance_id);
  // create new request
  router.post("/create", request.create);
  //update request
  router.post("/update/:id", request.updateRequest);

  app.use("/api/request", router);
};

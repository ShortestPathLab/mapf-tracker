import { Router } from "express";
import * as map from "../controllers/map.controller";
const router = Router();
export default (app) => {
  // Retrieve all Maps
  router.get("/", map.findAll);

  // Retrieve a single Map with id
  router.get("/:id", map.findOne);
  app.use("/api/map", router);
};

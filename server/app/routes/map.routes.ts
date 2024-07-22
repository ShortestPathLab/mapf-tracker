import { Router } from "express";
import * as map from "../controllers/map.controller";
const router = Router();
export default (app) => {
  router.get("/", map.findAll);
  router.get("/:id", map.findOne);
  app.use("/api/map", router);
};

import { Router } from "express";
import * as scen from "../controllers/scenario.controller";

export default (app) => {
  const router = Router();
  router.get("/", scen.findAll);
  router.get("/map/:id", scen.findByMap_id);
  router.get("/map/:id/:scen_type", scen.findByMap_id_Map_type);
  router.get("/:id", scen.findById);
  app.use("/api/scenario", router);
};

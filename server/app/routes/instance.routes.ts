import { Router } from "express";
import * as instance from "../controllers/instance.controller";

export default (app) => {
  const router = Router();
  router.get("/", instance.findAll);
  router.get("/:id", instance.findNonEmptyByScenId);
  router.get("/getAlgo/:id", instance.findAlgosRecord);
  router.get("/getPath/:id", instance.findPathById);
  router.get("/DownloadRow/:id", instance.downloadRowById);
  router.get("/DownloadInstance/:id", instance.downloadNonEmptyByScenId);
  router.get("/DownloadMapByID/:id", instance.downloadMapByID);
  router.get("/test/:id", instance.get_map_level_summary);
  app.use("/api/instance", router);
};

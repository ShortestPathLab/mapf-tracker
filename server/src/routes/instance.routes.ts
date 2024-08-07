import { Router } from "express";
import * as instance from "../controllers/instance.controller";
import { middleware as cache } from "apicache";

export default (app) => {
  const router = Router();
  router.use(cache("1 day"));
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

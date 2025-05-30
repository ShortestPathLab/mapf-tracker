import { Application, Router } from "express";
import {
  findAll,
  findNonEmptyByScenId,
  findById,
  findAlgosRecord,
  findPathById,
  downloadRowById,
  downloadNonEmptyByScenId,
  downloadMapByID,
  get_map_level_summary,
} from "../controllers/instance";

export default (app: Application) => {
  const router = Router();
  // router.use(cache("1 day"));
  router.get("/", findAll);
  router.get("/:id", findNonEmptyByScenId);
  router.get("/id/:id", findById);
  router.get("/getAlgo/:id", findAlgosRecord);
  router.get("/getPath/:id", findPathById);
  router.get("/DownloadRow/:id", downloadRowById);
  router.get("/DownloadInstance/:id", downloadNonEmptyByScenId);
  router.get("/DownloadMapByID/:id", downloadMapByID);
  router.get("/test/:id", get_map_level_summary);
  app.use("/api/instance", router);
};

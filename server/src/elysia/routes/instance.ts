import { Elysia } from "elysia";
import * as instance from "../../controllers/instance";

// Static segments registered before the dynamic `/:id` so they aren't shadowed.
export const instanceRoutes = new Elysia({ prefix: "/api/instance" })
  .get("/", instance.findAll)
  .get("/id/:id", instance.findById)
  .get("/getAlgo/:id", instance.findAlgosRecord)
  .get("/DownloadRow/:id", instance.downloadRowById)
  .get("/DownloadInstance/:id", instance.downloadNonEmptyByScenId)
  .get("/DownloadMapByID/:id", instance.downloadMapByID)
  .get("/test/:id", instance.get_map_level_summary)
  .get("/:id", instance.findNonEmptyByScenId);

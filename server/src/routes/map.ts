import { Router, Application } from "express";
import * as map from "../controllers/map";
import { middleware as cache } from "apicache";

export default (app: Application) => {
  const router = Router();
  // router.use(cache("1 day"));
  router.get("/", map.findAll);
  router.get("/:id", map.findOne);
  router.post("/preview", map.preview);
  app.use("/api/map", router);
};

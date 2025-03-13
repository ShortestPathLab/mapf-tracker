import { submitHandler } from "controllers/sync";
import { Application, Router } from "express";
import passport from "passport";
import * as controller from "../controllers/user";
import { authenticate } from "auth";

export default (app: Application) =>
  app.use(
    "/api/user",
    authenticate,
    Router()
      .post("/notify", controller.createKeyAndSendMail)
      .put("/sendMail", controller.sendMail)
      .post("/submit", submitHandler)
      .get("/:id", controller.findSubmittedAlgoByID)
      .put("/updateAlgo/:id", controller.updateAlgoByID)
      .put("/createAlgo", controller.createAlgo)
      .post("/checkAlgo/:id", controller.checkAlgoExist)
      .get("/getMapSubmittedInfo/:id", controller.getMapSubmittedInfo)
      .put("/submitChunkResults/:id", controller.submitData)
  );

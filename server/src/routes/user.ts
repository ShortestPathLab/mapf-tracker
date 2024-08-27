import { authJwt } from "../middlewares";
import * as controller from "../controllers/user";
import { Application } from "express";
import { submitHandler } from "controllers/sync";

export default (app: Application) => {
  app.use((req, res, next) => {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });
  //FIXME: update JWT
  app.post("/api/user/notify", controller.createKeyAndSendMail);
  app.put("/api/user/sendMail", [authJwt.verifyToken], controller.sendMail);
  app.post("/api/user/submit", submitHandler);
  app.get(
    "/api/userAlgo/:id",
    [authJwt.verifyToken],
    controller.findSubmittedAlgoByID
  );
  app.put(
    "/api/user/updateAlgo/:id",
    [authJwt.verifyToken],
    controller.updateAlgoByID
  );
  app.put("/api/user/createAlgo", [authJwt.verifyToken], controller.createAlgo);
  app.post(
    "/api/user/checkAlgo/:id",
    [authJwt.verifyToken],
    controller.checkAlgoExist
  );
  app.get(
    "/api/user/getMapSubmittedInfo/:id",
    [authJwt.verifyToken],
    controller.getMapSubmittedInfo
  );
  app.put(
    "/api/user/submitChunkResults/:id",
    [authJwt.verifyToken],
    controller.submitData
  );
};

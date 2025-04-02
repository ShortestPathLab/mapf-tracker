import { submitHandler } from "controllers/sync";
import { Application, Router } from "express";
import passport from "passport";
import * as controller from "../controllers/user";
import { authenticate } from "auth";
import { User, users } from "models";
import { route } from "query";
import { z } from "zod";
import { password } from "bun";
import { Types } from "mongoose";

const { hash } = password;

export default (app: Application) =>
  app.use(
    "/api/user",
    authenticate,
    Router()
      .use(
        "/basic",
        passport.authenticate("jwt", { session: false }),
        users.basic(
          Router().post(
            "/write",
            route(
              z.object({
                username: z.string(),
                password: z.string(),
                id: z.string().optional(),
              }),
              async ({ username, password, id }) => {
                const result = await User.findOneAndUpdate(
                  { _id: id ?? new Types.ObjectId() },
                  { $set: { username, hash: await hash(password) } },
                  { upsert: true }
                );
                return { id: result?.id?.toString?.() };
              }
            )
          )
        )
      )
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

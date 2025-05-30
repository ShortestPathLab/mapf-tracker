import { Application, Router } from "express";
import passport from "passport";
import { createKeyAndSendMail } from "controllers/user";
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
      .post("/notify", createKeyAndSendMail)
  );

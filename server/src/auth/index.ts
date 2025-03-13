import assert from "assert";
import { password } from "bun";
import { Application, Router } from "express";
import { sign } from "jsonwebtoken";
import { isString } from "lodash";
import { User } from "models";
import passport from "passport";
import { ExtractJwt, Strategy as JwtStrategy } from "passport-jwt";
import { env } from "process";
import { route } from "query";
import { z } from "zod";

const { verify, hash } = password;

const registrationEnabled = env?.REGISTRATION_ENABLED === "1";

export const authenticate = passport.authenticate("jwt", { session: false });

function signUser(username: string) {
  assert(isString(env?.JWT_SECRET), "JWT_SECRET not set");
  return {
    token: sign({ sub: username }, env.JWT_SECRET),
    username,
  };
}

export const use = (app: Application, path: string = "/api/auth") => {
  assert(isString(env?.JWT_SECRET), "JWT_SECRET not set");
  passport.use(
    new JwtStrategy(
      {
        secretOrKey: env.JWT_SECRET,
        passReqToCallback: true,
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      },
      async (_, payload, done) => {
        const user = await User.findOne({ username: payload.sub });
        if (!user) return done(null, false);
        return done(null, { username: user.username });
      }
    )
  );
  app.use(
    path,
    Router()
      .post(
        "/login",
        route(
          z.object({ username: z.string(), password: z.string() }),
          async ({ username, password }) => {
            const user = await User.findOne({ username });
            if (!user || !user.hash || !(await verify(password, user.hash)))
              throw new Error("Username or password incorrect");
            return signUser(username);
          }
        )
      )
      .post(
        "/register",
        route(
          z.object({ username: z.string(), password: z.string() }),
          async ({ username, password }) => {
            if (!registrationEnabled)
              throw new Error("Registration is not enabled");
            await new User({ username, hash: await hash(password) }).save();
            return signUser(username);
          }
        )
      )
  );
};

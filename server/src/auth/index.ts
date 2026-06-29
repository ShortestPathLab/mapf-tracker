import assert from "assert";
import { password } from "bun";
import { Elysia, type Context, status } from "elysia";
import { sign, verify as verifyJwt } from "jsonwebtoken";
import { isString } from "lodash";
import { User } from "models";
import { env } from "process";
import { z } from "zod";

const { verify, hash } = password;

const registrationEnabled = env?.REGISTRATION_ENABLED === "1";

function signUser(username: string) {
  assert(isString(env?.JWT_SECRET), "JWT_SECRET not set");
  return {
    token: sign({ sub: username }, env.JWT_SECRET),
    username,
  };
}

/**
 * Native Elysia auth guard. Verifies the Bearer JWT against JWT_SECRET and
 * confirms the user still exists, mirroring the previous passport-jwt strategy.
 * Returns 401 (via `error`) when authentication fails; use as a `beforeHandle`.
 */
export const requireAuth = async ({ headers }: Context) => {
  assert(isString(env?.JWT_SECRET), "JWT_SECRET not set");
  const header = headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
  if (!token) return status(401, "Unauthorized");
  try {
    const payload = verifyJwt(token, env.JWT_SECRET) as { sub?: string };
    const user = payload.sub ? await User.findOne({ username: payload.sub }) : null;
    if (!user) return status(401, "Unauthorized");
  } catch {
    return status(401, "Unauthorized");
  }
};

const credentials = z.object({ username: z.string(), password: z.string() });

export const authRoutes = new Elysia({ prefix: "/api/auth" })
  .post("/login", async ({ body }) => {
    const { username, password } = credentials.parse(body);
    const user = await User.findOne({ username });
    if (!user || !user.hash || !(await verify(password, user.hash)))
      return status(401, "Username or password incorrect");
    return signUser(username);
  })
  .post("/register", async ({ body }) => {
    const { username, password } = credentials.parse(body);
    if (!registrationEnabled) return status(403, "Registration is not enabled");
    await new User({ username, hash: await hash(password) }).save();
    return signUser(username);
  });

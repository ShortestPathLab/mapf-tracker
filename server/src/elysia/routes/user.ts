import { password } from "bun";
import { Elysia } from "elysia";
import { Types } from "mongoose";
import { requireAuth } from "auth";
import { User } from "models";
import { createKeyAndSendMail } from "../../controllers/user";

const { hash } = password;

// The whole /api/user surface requires auth. The basic CRUD is inlined here
// (rather than `users.basic()`) because its `/write` hashes the password.
export const userRoutes = new Elysia({ prefix: "/api/user" }).guard(
  { beforeHandle: requireAuth },
  (app) =>
    app.post("/notify", createKeyAndSendMail).group("/basic", (basic) =>
      basic
        .get("/", () => User.find())
        .get("/:id", ({ params }) => User.findById(params.id))
        .post("/write", async ({ body }) => {
          const { username, password: pw, id } = body as {
            username: string;
            password: string;
            id?: string;
          };
          const result = await User.findOneAndUpdate(
            { _id: id ?? new Types.ObjectId() },
            { $set: { username, hash: await hash(pw) } },
            { upsert: true },
          );
          return { id: result?.id?.toString?.() };
        })
        .post("/delete", async ({ body }) => {
          const { id } = body as { id?: string };
          await User.findByIdAndDelete(id);
          return { id };
        }),
    ),
);

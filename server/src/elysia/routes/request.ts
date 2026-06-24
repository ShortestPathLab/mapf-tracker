import { Elysia } from "elysia";
import { requireAuth } from "auth";
import { requests } from "models";
import * as request from "../../controllers/request";

export const requestRoutes = new Elysia({ prefix: "/api/request" })
  .get("/", request.findAll, { beforeHandle: requireAuth })
  .get("/key/:key", request.findByKey)
  .get("/id/:id", request.findByInstance_id)
  .get("/email/:email", request.findByEmail)
  .post("/create", request.create)
  .post("/update/:id", request.updateRequest)
  .post("/updateElevated/:id", request.updateRequestElevated, {
    beforeHandle: requireAuth,
  })
  .group("/basic", (app) => app.use(requests.basic(requireAuth)));

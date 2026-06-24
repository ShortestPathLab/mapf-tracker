import { Elysia } from "elysia";
import * as ongoingSubmission from "../../controllers/ongoingSubmission";

// Static-prefixed routes registered before the dynamic `/:apiKey` (GET/DELETE)
// so they aren't shadowed. Optional `:page?`/`:label?` are two routes each.
export const ongoingSubmissionRoutes = new Elysia({
  prefix: "/api/ongoing_submission",
})
  .get("/", ongoingSubmission.findAll)
  .get("/id/:id", ongoingSubmission.findById)
  .post("/delete", ongoingSubmission.deleteById)
  .get("/status/:apiKey", ongoingSubmission.statusByApiKey)
  .post("/status", ongoingSubmission.status)
  .get(
    "/summary-pagecount/:apiKey",
    ongoingSubmission.summaryPageCountByApiKeyGeneral,
  )
  .get("/summary/:apiKey", ongoingSubmission.summaryByApiKey)
  .get("/summary/:apiKey/:page", ongoingSubmission.summaryByApiKey)
  .get("/scenario/:apiKey/:scenario", ongoingSubmission.findByScenario)
  .get("/finalise/:key", ongoingSubmission.finalise)
  .post("/create/:apiKey", ongoingSubmission.create)
  .post("/create/:apiKey/:label", ongoingSubmission.create)
  .get("/:apiKey", ongoingSubmission.summaryByApiKeyGeneral)
  .delete("/:apiKey", ongoingSubmission.deleteByApiKey);

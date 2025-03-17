import { Router, Application } from "express";
import * as submission_key from "../controllers/submissionKey";
import { SubmissionKey, submissionKeys } from "models";
import passport from "passport";

export default (app: Application) => {
  const router = Router();
  router.use(
    "/basic",
    passport.authenticate("jwt", { session: false }),
    submissionKeys.basic()
  );
  router.get("/", submission_key.findAll);
  router.get("/:apiKey", submission_key.findByApiKey);
  router.post(
    "/create/:request",
    passport.authenticate("jwt", { session: false }),
    submission_key.create
  );
  router.get("/find/:request_id", submission_key.findByRequestId);

  app.use("/api/submission_key", router);
};

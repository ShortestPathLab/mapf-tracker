module.exports = (app) => {
  const submission_key = require("../controllers/submission_key.controller.ts");

  var router = require("express").Router();

  // Retrieve all submission_keys
  router.get("/", submission_key.findAll);

  // Retrieve a single submission_key with api key
  router.get("/:apiKey", submission_key.findByApiKey);

  // Create a submission_key with new api key
  router.post("/create", submission_key.create);

  // retrieve api key for the request id
  router.get("/find/:request_id", submission_key.findByRequestId);

  app.use("/api/submission_key", router);
};

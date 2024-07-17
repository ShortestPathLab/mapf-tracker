const submission = require("../controllers/submission.controller.ts");
module.exports = (app) => {
  const submission = require("../controllers/submission.controller.ts");

  var router = require("express").Router();

  router.get("/instance/:id", submission.findByInstance_id);
  router.get("/leadingSolution/:id", submission.findLeadingSolutionInstance_id);
  router.get(
    "/leadingLowerbound/:id",
    submission.findLeadingLowerboundInstance_id
  );
  app.use("/api/submission", router);
};

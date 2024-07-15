module.exports = app => {
    const submission_key = require("../controllers/submission_key.controller");

    var router = require("express").Router();

    // Retrieve all submission_keys
    router.get("/", submission_key.findAll);

    // Retrieve a single submission_key with api key
    router.get("/:apiKey", submission_key.findByApiKey);

    router.post("/create",  submission_key.create);
    app.use("/api/submission_key", router);
};
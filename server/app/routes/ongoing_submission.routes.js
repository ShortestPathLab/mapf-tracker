module.exports = app => {
    const ongoing_submission = require("../controllers/ongoing_submission.controller.js");
    var router = require("express").Router();
    // Retrieve all ongoing_submission
    router.get("/", ongoing_submission.findAll);
    // Retrieve a ongoing_submission with id
    router.get("/:id", ongoing_submission.findByInstance_id);
    // Retrieve all ongoing_submission with the apikey
    router.get("/:api_key", ongoing_submission.findByApiKey);
    // create a ne wongoing submission 
    router.post("/create",  ongoing_submission.create);
    
    app.use("/api/ongoing_submission", router);
};
module.exports = app => {
    const request = require("../controllers/request.controller.js");
    var router = require("express").Router();
    // Retrieve all requester
    router.get("/", request.findAll);
    // Retrieve a single requester with id
    router.get("/:id", request.findByInstance_id);
    router.post("/create",  request.create);
    app.use("/api/request", router);
};
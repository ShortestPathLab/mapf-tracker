module.exports = app => {
    const requester = require("../controllers/requester.controller.js");

    var router = require("express").Router();

    // Retrieve all requester
    router.get("/", requester.findAll);

    // Retrieve a single requester with id
    router.get("/:id", requester.findByInstance_id);

    app.use("/api/requester", router);
};
const db = require("../models");
const mongoose = require("mongoose");
const Requester = db.requesters;

exports.findAll = (req, res) => {
    Requester.find({})
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving requesters."
            });
        });
};


// Find a single Tutorial with an id
exports.findByInstance_id = (req, res) => {
    const id = req.params.id;

    Requester.find({instance_id : id})
        .then(data => {
            if (!data)
                res.status(404).send({ message: "Not found Requester with id " + id });
            else res.send(data);
        })
        .catch(err => {
            res
                .status(500)
                .send({ message: "Error retrieving Requester with id=" + id });
        });
};
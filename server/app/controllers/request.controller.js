const db = require("../models");
const mongoose = require("mongoose");
const Request = db.requests;

exports.findAll = (req, res) => {
    Request.find({})
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving request."
            });
        });
};


// Find a single Tutorial with an id
exports.findByInstance_id = (req, res) => {
    const id = req.params.id;

    Request.find({instance_id : id})
        .then(data => {
            if (!data)
                res.status(404).send({ message: "Not found request with id " + id });
            else res.send(data);
        })
        .catch(err => {
            res
                .status(500)
                .send({ message: "Error retrieving request with id=" + id });
        });
};

exports.create = async (req, res) => {
    if (!req.body.requesterName) {
      return res.status(400).send({ message: "Requester name can not be empty!" });
    }
  
    const request = new Request({
      requesterName: req.body.requesterName,
      requesterEmail: req.body.requesterEmail,
      requesterAffiliation: req.body.requesterAffiliation,
      googleScholar: req.body.googleScholar,
      dblp: req.body.dblp,
      justification: req.body.justification,
      algorithmName: req.body.algorithmName,
      authorName: req.body.authorName,
      paperReference: req.body.paperReference,
      githubLink: req.body.githubLink,
      comments: req.body.comments,
    });

    request.save(request)
    .then(data => {
        res.send(data);
    })
    .catch(err => {
        res.status(500).send({
            message:
                err.message || "Some error occurred while creating the Requester."
        });
    });


  };
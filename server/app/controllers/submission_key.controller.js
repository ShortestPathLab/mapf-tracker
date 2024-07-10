const db = require("../models");
const mongoose = require("mongoose");
const Submission_key = db.submission_keys;
const crypto = require('crypto');


exports.findAll = (req, res) => {
    Submission_key.find({})
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




// Find a single Submission_key by apiKey
exports.findByApiKey = (req, res) => {
    const apiKey = req.params.apiKey; // Assuming apiKey is passed in req.params

    Submission_key.findOne({ apiKey: apiKey })
        .then(data => {
            if (!data)
                res.status(404).send({ message: "Not found Submission_key with apiKey " + apiKey });
            else
                res.send(data);
        })
        .catch(err => {
            res.status(500).send({ message: "Error retrieving Submission_key with apiKey=" + apiKey });
        });
};

// return requester information (using the requestID )
exports.create = async (req, res) => {
    if (!req.body.algo_id) {
      return res.status(400).send({ message: "Algorithm cannot be empty!" });
    }
    const apiKey = crypto.randomBytes(16).toString('hex');
    const creationDate = new Date();
    const expirationDate = new Date();
    expirationDate.setMonth(expirationDate.getMonth() + 1); // API key valid for one month
  
    const submission_key = new Submission_key({
      request_id : req.body.request_id,
      api_key : apiKey,
      creationDate : creationDate, 
      expirationDate : expirationDate
    });

    submission_key.save(submission_key)
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
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


exports.findByRequestId = (req, res) => {
    const requestId = req.params.request_id; // or req.query.request_id if it's a query parameter
    console.log(requestId)
    Submission_key.find({ request_id: requestId })
      .then(data => {
        if (!data) {
          res.status(404).send({
            message: `No submission found with request_id ${requestId}`
          });
        } else {
          res.send(data);
          console.log(data)
        }
      })
      .catch(err => {
        res.status(500).send({
          message: err.message || "Some error occurred while retrieving the submission."
        });
      });
  };
  

// Find a single Submission_key by apiKey
exports.findByApiKey = (req, res) => {
    const apiKey = req.params.apiKey; // Assuming apiKey is passed in req.params
    console.log('request api key : ', apiKey)
    Submission_key.findOne({ api_key: apiKey })
        .then(data => {
            if (!data)
                res.status(404).send({ message: "Not found Submission_key with apiKey " + apiKey });
            else{
                res.send(data);
                console.log('data for aubmission key is : ', data)
            }
        })
        .catch(err => {
            res.status(500).send({ message: "Error retrieving Submission_key with apiKey=" + apiKey });
        });
};


// find by api key and retrive the 



// return requester information (using the requestID )
exports.create = async (req, res) => {
    if (!req.body.request_id) {
      return res.status(400).send({ message: "Request id cannot be empty!" });
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
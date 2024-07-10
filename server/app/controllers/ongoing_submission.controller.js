const db = require("../models");
const mongoose = require("mongoose");
const OngoingSubmission = db.ongoing_submissions;
const Map = db.maps;

// find all submissions
exports.findAll = (req, res) => {
    OngoingSubmission.find({})
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving OngoingSubmission."
            });
        });
};


// find a submission using id 
exports.findByInstance_id = (req, res) => {
    const id = req.params.id;

    OngoingSubmission.find({instance_id : id})
        .then(data => {
            if (!data)
                res.status(404).send({ message: "Not found OngoingSubmission with id " + id });
            else res.send(data);
        })
        .catch(err => {
            res
                .status(500)
                .send({ message: "Error retrieving OngoingSubmission with id=" + id });
        });
};


// Find all OngoingSubmission entries with a given api_key
exports.findByApiKey = (req, res) => {
    const apiKey = req.params.apiKey;

    OngoingSubmission.find({ api_key: apiKey })
        .then(data => {
            if (!data || data.length === 0) {
                res.status(404).send({ message: "Not found OngoingSubmission with apiKey " + apiKey });
            } else {
                res.send(data);
            }
        })
        .catch(err => {
            res.status(500).send({ message: "Error retrieving OngoingSubmission with apiKey=" + apiKey });
        });
};


// create a new ongoing submission 
exports.create = async (req, res) => {
    // Define validation rules
    const validations = [
        { field: 'api_key', message: 'API key cannot be empty!' },
        { field: 'agents', message: 'Agents cannot be empty!' },
        { field: 'lower_cost', message: 'Lower cost cannot be empty!' },
        { field: 'solution_cost', message: 'Solution cost cannot be empty!' },
        { field: 'map_name', message: 'Map name cannot be empty!' },
        { field: 'scen_type', message: 'Scenario type (even or random)cannot be empty!' },
        { field: 'type_id', message: 'Type id cannot be empty!' }
    ];

    // Iterate through validation rules ( ensure all parameters was defined)
    for (const validation of validations) {
        if (!req.body[validation.field]) {
            return res.status(400).send({ message: validation.message });
        }
    }
    // check if the map exist and retrieve map id 
    var map = await Map.findOne({"map_name": req.body.map_name}).catch(err => {
        res.status(400).send({
            message:
                err.message || "Some error occurred while finding map."
        });
    });
    if(!map){
        res.status(400).send({message: "Error: map not found"});
        return;
    }
    var map_id  = map._id

    // check if the scenario exist
    var scen = await Scenario.findOne({"map_id": map_id, "scen_type": req.body.scen_type, "type_id": parseInt(req.body.type_id)}).catch(err => {
        res.status(400).send({
            message:
                err.message || "Some error occurred while finding scenario."
        });
    });
    if(!scen){
        res.status(400).send({message: "Error: scenario not found"});
        return;
    }
    var scen_id  = scen._id

    // check if instance ( agent exist)
    var curr_instance = await Instance.findOne({"map_id": map_id, "scen_id": scen_id, "agents":parseInt(req.body.agents)}).catch(err => {
        res.status(400).send({
            message:
                err.message || "Some error occurred while finding instance."
        });
    });
    if(!curr_instance){
        res.status(400).send({message: "Error: instance not found"});
        return;
    }
    var instance_id = curr_instance._id;

    // create new ongoing submission data
    const new_ongoing_submission = new OngoingSubmission({
        "api_key": req.body.api_key,
        "map_id" :  map_id,
        "instance_id" :instance_id,
        "scen_id": scen_id,
        "agents": parseInt(req.body.agents),    
        "lower_cost": req.body.lower_cost ,
        "solution_cost": req.body.solution_cost,
        "error": {isError:false , errorMessage:''}
    });

    new_ongoing_submission.save(new_ongoing_submission)
    .then(data => {
        res.send(data);
    })
    .catch(err => {
        res.status(500).send({
            message:
                err.message || "Some error occurred while creating the ongoing submission ."
        });
    });
  };
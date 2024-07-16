const dbConfig = require("../config/db.config.js");

const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const db = {};
db.mongoose = mongoose;
db.url = dbConfig.url;
db.maps = require("./map.model")(mongoose);
db.scenarios = require("./scenario.model")(mongoose);
db.instances = require("./instance.model")(mongoose);
db.submissions = require("./submission.model")(mongoose);
db.algorithms = require("./algorithm.model")(mongoose);
db.users = require("./user.model")(mongoose);
db.solution_paths = require("./solution_path.model")(mongoose);
db.requests = require("./request.model")(mongoose);
db.submission_keys = require("./submission_key.model")(mongoose);
db.ongoing_submissions = require("./ongoing_submission.model")(mongoose);

module.exports = db;
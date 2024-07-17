///@ts-nocheck

const dbConfig = require("../config/db.config.ts");

const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

let db = {};
db.mongoose = mongoose;
db.url = dbConfig.url;
db.maps = require("./map.model.ts")(mongoose);
db.scenarios = require("./scenario.model.ts")(mongoose);
db.instances = require("./instance.model.ts")(mongoose);
db.submissions = require("./submission.model.ts")(mongoose);
db.algorithms = require("./algorithm.model.ts")(mongoose);
db.users = require("./user.model.ts")(mongoose);
db.solution_paths = require("./solution_path.model.ts")(mongoose);
db.requests = require("./request.model.ts")(mongoose);
db.submission_keys = require("./submission_key.model.ts")(mongoose);
db.ongoing_submissions = require("./ongoing_submission.model.ts")(mongoose);

module.exports = db;

import mongoose from "mongoose";
import dbConfig from "../config/db.config";
import algorithmModel from "./algorithm.model";
import instanceModel from "./instance.model";
import mapModel from "./map.model";
import ongoingSubmissionModel from "./ongoing_submission.model";
import requestModel from "./request.model";
import scenarioModel from "./scenario.model";
import solutionPathModel from "./solution_path.model";
import submissionModel from "./submission.model";
import submissionKeyModel from "./submission_key.model";
import userModel from "./user.model";

mongoose.Promise = global.Promise;

export default {
  mongoose: mongoose,
  url: dbConfig.url,
  maps: mapModel(mongoose),
  scenarios: scenarioModel(mongoose),
  instances: instanceModel(mongoose),
  submissions: submissionModel(mongoose),
  algorithms: algorithmModel(mongoose),
  users: userModel(mongoose),
  solution_paths: solutionPathModel(mongoose),
  requests: requestModel(mongoose),
  submission_keys: submissionKeyModel(mongoose),
  ongoing_submissions: ongoingSubmissionModel(mongoose),
};

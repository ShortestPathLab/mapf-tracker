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
  mongoose,
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
};

export const OngoingSubmission = ongoingSubmissionModel(mongoose);
export const Map = mapModel(mongoose);
export const Scenario = scenarioModel(mongoose);
export const Instance = instanceModel(mongoose);
export const Submission = submissionModel(mongoose);
export const Algorithms = algorithmModel(mongoose);
export const User = userModel(mongoose);
export const SolutionPath = solutionPathModel(mongoose);
export const Request = requestModel(mongoose);
export const SubmissionKey = submissionKeyModel(mongoose);

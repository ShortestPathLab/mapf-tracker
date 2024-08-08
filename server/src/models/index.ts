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

export const OngoingSubmission = ongoingSubmissionModel(mongoose);
export const Map = mapModel(mongoose);
export const Scenario = scenarioModel(mongoose);
export const Instance = instanceModel(mongoose);
export const Submission = submissionModel(mongoose);
export const Algorithm = algorithmModel(mongoose);
export const User = userModel(mongoose);
export const SolutionPath = solutionPathModel(mongoose);
export const Request = requestModel(mongoose);
export const SubmissionKey = submissionKeyModel(mongoose);

export default {
  mongoose,
  url: dbConfig.url,
  maps: Map,
  scenarios: Scenario,
  instances: Instance,
  submissions: Submission,
  algorithms: Algorithm,
  users: User,
  solution_paths: SolutionPath,
  requests: Request,
  submission_keys: SubmissionKey,
};

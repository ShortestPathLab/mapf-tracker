import mongoose from "mongoose";
import dbConfig from "../config/db.config";
import algorithmModel from "./Algorithm";
import instanceModel from "./Instance";
import mapModel from "./Map";
import ongoingSubmissionModel from "./OngoingSubmission";
import requestModel from "./Request";
import scenarioModel from "./Scenario";
import solutionPathModel from "./SolutionPath";
import submissionModel from "./Submission";
import submissionKeyModel from "./SubmissionKey";
import userModel from "./User";

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

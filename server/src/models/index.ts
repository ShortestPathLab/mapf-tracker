import mongoose, { Document, Model } from "mongoose";

mongoose.Promise = global.Promise;

export { model as Algorithm, query as algorithms } from "./Algorithm";

export { model as Instance, query as instances } from "./Instance";

export { model as Map, query as maps } from "./Map";
export { model as OngoingSubmission } from "./OngoingSubmission";
export { model as PipelineStatus } from "./PipelineStatus";
export { model as Request, query as requests } from "./Request";
export { model as Scenario } from "./Scenario";
export { model as SolutionPath } from "./SolutionPath";
export { model as Submission, query as submissions } from "./Submission";
export {
  model as SubmissionKey,
  query as submissionKeys,
} from "./SubmissionKey";
export { model as User, query as users } from "./User";

export type InferRaw<T extends Model<any, any, any, any>> = T extends Model<
  infer R,
  any,
  any,
  any
>
  ? R
  : never;
export type Infer<T extends Model<any, any, any, any>> = InferRaw<T> &
  Document<InferRaw<T>>;

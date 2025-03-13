import mongoose, { Model } from "mongoose";
import config from "config/db";
import { Document } from "mongoose";
import { queryClient } from "query";

mongoose.Promise = global.Promise;

export { model as Algorithm, query as algorithms } from "./Algorithm";

export { model as Instance, query as instances } from "./Instance";

export { model as Map, query as maps } from "./Map";
export { model as OngoingSubmission } from "./OngoingSubmission";
export { model as Request } from "./Request";
export { model as Scenario } from "./Scenario";
export { model as SolutionPath } from "./SolutionPath";
export { model as Submission, query as submissions } from "./Submission";
export { model as SubmissionKey } from "./SubmissionKey";
export { model as User, query as users } from "./User";
export { model as PipelineStatus } from "./PipelineStatus";

export const url = config.url;

export type Infer<T extends Model<any, any, any, any>> = T extends Model<
  infer R,
  any,
  any,
  any
>
  ? R & Document<unknown, any, R>
  : never;

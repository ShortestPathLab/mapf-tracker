import { use as useAuth } from "auth";
import { Application } from "express";
import { use as useQueries } from "./query/queries";
import algorithmRoutes from "./routes/algorithm";
import instanceRoutes from "./routes/instance";
import mapRoutes from "./routes/map";
import ongoingSubmissionRoutes from "./routes/ongoingSubmission";
import pipelineRoutes from "./routes/pipeline";
import requestRoutes from "./routes/request";
import scenarioRoutes from "./routes/scenario";
import solutionPathRoutes from "./routes/solutionPath";
import solutionSubmissionRoutes from "./routes/solutionSubmission";
import submissionRoutes from "./routes/submission";
import submissionKeyRoutes from "./routes/submissionKey";
import userRoutes from "./routes/user";
import { use as useBulk } from "./controllers/bulk";
import { use as useInfo } from "./controllers/info";

export const createRouters = (app: Application) => {
  mapRoutes(app);
  instanceRoutes(app);
  submissionRoutes(app);
  solutionSubmissionRoutes(app);
  scenarioRoutes(app);
  algorithmRoutes(app);
  userRoutes(app);
  solutionPathRoutes(app);
  requestRoutes(app);
  submissionKeyRoutes(app);
  ongoingSubmissionRoutes(app);
  pipelineRoutes(app);
  //
  useQueries(app);
  useAuth(app);
  useBulk(app);
  useInfo(app);
};

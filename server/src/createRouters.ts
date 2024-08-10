import mapRoutes from "./routes/map";
import instanceRoutes from "./routes/instance";
import submissionRoutes from "./routes/submission";
import solutionSubmissionRoutes from "./routes/solutionSubmission";
import scenarioRoutes from "./routes/scenario";
import algorithmRoutes from "./routes/algorithm";
import authRoutes from "./routes/auth";
import userRoutes from "./routes/user";
import solutionPathRoutes from "./routes/solutionPath";
import requestRoutes from "./routes/request";
import submissionKeyRoutes from "./routes/submissionKey";
import ongoingSubmissionRoutes from "./routes/ongoingSubmission";
import { Application } from "express";

export const createRouters = (app: Application) => {
  mapRoutes(app);
  instanceRoutes(app);
  submissionRoutes(app);
  solutionSubmissionRoutes(app);
  scenarioRoutes(app);
  algorithmRoutes(app);
  authRoutes(app);
  userRoutes(app);
  solutionPathRoutes(app);
  requestRoutes(app);
  submissionKeyRoutes(app);
  ongoingSubmissionRoutes(app);
};

import { restore as restoreOngoingSubmission } from "controllers/ongoingSubmission";
import { restore as restorePipeline } from "controllers/pipeline";
import { restore as restorePrecompute } from "query/withDiskCache";
import { connectToDatabase } from "./connection";
import { app } from "./createElysiaApp";
import { getPort } from "./getPort";
import { log } from "./logging";

await connectToDatabase(32);

const port = getPort();
app.listen(port);
log.info(`Server is running on port ${port}`);

log.info(
  process.env.NODE_ENV === "development"
    ? "Development mode"
    : "Production mode"
);

if (process.env.NODE_ENV !== 'development') {
  log.info("Restoring");

  for (const f of [
    restoreOngoingSubmission,
    restorePipeline,
    restorePrecompute,
  ]) {
    f();
  }
}
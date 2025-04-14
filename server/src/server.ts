import bodyParser from "body-parser";
import { restore as restoreOngoingSubmission } from "controllers/ongoingSubmission";
import { restore as restorePipeline } from "controllers/pipeline";
import { restore as restorePrecompute } from "query/withDiskCache";
import cors from "cors";
import express, { urlencoded } from "express";
import { csvParser, yamlParser } from "./body-parsers";
import { connectToDatabase } from "./connection";
import { createDevServer as createServer } from "./createDevServer";
import { createRouters } from "./createRouters";
import { createStaticRoutes } from "./createStaticRoutes";
import { log } from "./logging";
import compression from "compression";

export const app = express();

app.use(cors());

app.use(compression());

app.use(yamlParser);
app.use(csvParser);

app.use(bodyParser.text({ limit: "500mb" }));
app.use(
  bodyParser.urlencoded({
    limit: "500mb",
    extended: true,
    parameterLimit: 500_000,
  })
);
app.use(urlencoded({ extended: true }));

await connectToDatabase(32);

createRouters(app);

app.get("/api/heartbeat", (req, res) => {
  res.send("OK");
});

createStaticRoutes(app);

app.get("/", (req, res) => {
  res.send(process.env.APP_NAME ?? "mapf-tracker-api");
});
app.get("*", (req, res) => {
  res.send("Not found");
});

createServer(app);

log.info(
  process.env.NODE_ENV === "development"
    ? "Development mode"
    : "Production mode"
);

log.info("Restoring");

for (const f of [
  restoreOngoingSubmission,
  restorePipeline,
  restorePrecompute,
]) {
  f();
}

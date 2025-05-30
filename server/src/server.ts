import bodyParser from "body-parser";
import compression from "compression";
import { restore as restoreOngoingSubmission } from "controllers/ongoingSubmission";
import { restore as restorePipeline } from "controllers/pipeline";
import cors from "cors";
import express, { static as serve, urlencoded } from "express";
import { restore as restorePrecompute } from "query/withDiskCache";
import { csvParser, yamlParser } from "./body-parsers";
import { connectToDatabase } from "./connection";
import { createDevServer as createServer } from "./createDevServer";
import { createRouters } from "./createRouters";
import { log } from "./logging";

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

app.use("/res", serve(`${import.meta.dir}/resources`));

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

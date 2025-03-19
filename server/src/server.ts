import bodyParser from "body-parser";
import { restore as restoreOngoingSubmission } from "controllers/ongoingSubmission";
import cors from "cors";
import express, { urlencoded } from "express";
import path from "path";
import { csvParser, yamlParser } from "./body-parsers";
import { connectToDatabase } from "./connection";
import { createDevServer as createServer } from "./createDevServer";
import { createProductionServer } from "./createProductionServer";
import { createRouters } from "./createRouters";
import { createStaticRoutes } from "./createStaticRoutes";
import { log } from "./logging";
import { restore as restorePipeline } from "controllers/pipeline";

export const app = express();

app.use(cors());

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

await connectToDatabase();

app.use((request, response, next) => {
  if (
    process.env.NODE_ENV != "development" &&
    !request.secure &&
    !request.url.includes(".well-known")
  )
    return response.redirect(`https://${request.headers.host}${request.url}`);

  next();
});

createRouters(app);

app.get("/api/heartbeat", (req, res) => {
  res.send("OK");
});

createStaticRoutes(app);

app.get("*", (req, res) =>
  res.sendFile(path.join(__dirname, "../client/build", "index.html"))
);

createServer(app);

log.info(
  process.env.NODE_ENV === "development"
    ? "Development mode"
    : "Production mode"
);

log.info("Restoring");

for (const f of [restoreOngoingSubmission, restorePipeline]) {
  f();
}

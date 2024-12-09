import bodyParser from "body-parser";
import cors from "cors";
import express, { json, urlencoded } from "express";
import { pick } from "lodash";
import path from "path";
import logger from "pino-http";
import { connectToDatabase } from "./connection";
import { createDevServer } from "./createDevServer";
import { createProductionServer } from "./createProductionServer";
import { createRouters } from "./createRouters";
import { createStaticRoutes } from "./createStaticRoutes";
import { log } from "./logging";
import { csvParser, yamlParser } from "./body-parsers";
import { restore } from "controllers/ongoingSubmission";

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
// app.use(
//   logger({
//     customSuccessMessage: (req) => `[Server] ${req.method} ${req.url}`,
//     serializers: {
//       req(req) {
//         return pick(req, "url", "method", "id", "body");
//       },
//       res(res) {
//         return pick(res, "statusCode", "body");
//       },
//     },
//   })
// );

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

if (process.env.NODE_ENV === "development") {
  createDevServer(app);
} else {
  createProductionServer(app);
}

log.info(
  process.env.NODE_ENV === "development"
    ? "Development mode"
    : "Production mode"
);

log.info("Restoring");

for (const f of [restore]) {
  f();
}

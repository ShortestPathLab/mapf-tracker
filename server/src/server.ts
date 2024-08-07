import bodyParser from "body-parser";
import cors from "cors";
import express, { json, urlencoded } from "express";
import { log } from "./logging";
import path from "path";
import logger from "pino-http";
import { connectToDatabase } from "./connection";
import { createDevServer } from "./createDevServer";
import { createProductionServer } from "./createProductionServer";
import { createRouters } from "./createRouters";
import { createStaticRoutes } from "./createStaticRoutes";

export const app = express();

app.use(bodyParser.json({ limit: "500mb" }));
app.use(
  bodyParser.urlencoded({
    limit: "500mb",
    extended: true,
    parameterLimit: 500_000,
  })
);
app.use(cors());
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(logger());

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

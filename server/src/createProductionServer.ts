import { Application } from "express";
import fs from "fs";
import http from "http";
import https from "https";
import { log } from "./logging";

export function createProductionServer(app: Application) {
  const privateKey = fs.readFileSync("./credential/privkey.pem", "utf8");
  const certificate = fs.readFileSync("./credential/fullchain.pem", "utf8");
  const credentials = { key: privateKey, cert: certificate };
  const httpsServer = https.createServer(credentials, app);

  const https_port = 5443;
  const http_port = 5000;
  httpsServer.listen(https_port, () =>
    log.info(`Listening on port ${https_port} for https`)
  );

  const httpServer = http.createServer(app);

  httpServer.listen(http_port, () =>
    log.info(`Listening on port ${http_port} for http`)
  );
}

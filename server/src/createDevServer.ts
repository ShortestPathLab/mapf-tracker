import { getPort } from "getPort";
import { log } from "./logging";
import { Application } from "express";

export function createDevServer(app: Application) {
  const port = getPort();
  app.listen(port, () => log.info(`Server is running on port ${port}`));
}

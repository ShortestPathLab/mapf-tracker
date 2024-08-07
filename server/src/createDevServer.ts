import { log } from "./logging";
import { Application } from "express";

export function createDevServer(app: Application) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => log.info(`Server is running on port ${PORT}`));
}

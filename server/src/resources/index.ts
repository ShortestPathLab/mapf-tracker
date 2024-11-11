import { resourcesDevPath } from "./dev";
import { resourcesProductionPath } from "./production";

export const resourcesPath =
  process.env.NODE_ENV === "development"
    ? resourcesDevPath
    : resourcesProductionPath;

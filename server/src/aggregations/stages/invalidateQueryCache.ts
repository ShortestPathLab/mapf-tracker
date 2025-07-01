import { now } from "lodash";
import { set } from "models/Version";
import { PipelineStage } from "../pipeline";

export const invalidateQueryCache = async () => {
  await set("diskCache", now());
};

export const stage: PipelineStage = {
  key: "invalidateQueryCache",
  run: async () => ({
    result: await invalidateQueryCache(),
  }),
  dependents: [],
  description: () => `
  Marks all cached queries as invalidated, forcing them to be recomputed on the next request. This is useful when the underlying data has changed and you want to ensure that the cached results are up-to-date.`,
};

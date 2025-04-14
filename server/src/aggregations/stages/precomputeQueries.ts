import { diskCaches } from "query/withDiskCache";
import { PipelineStage } from "../pipeline";
import { capitalize, keys, startCase } from "lodash";

export const precomputeQueries = async () => {
  await diskCaches.precomputeAll();
};

export const stage: PipelineStage = {
  key: "precomputeQueries",
  run: async () => ({
    result: await precomputeQueries(),
  }),
  dependents: [],
  description: () => `
  Precomputes a range of data and saves them to disk for faster querying. Typically, long-running aggregations are handled as such:
  
  - On initial request, the aggregations are run and the result is cached to disk. 
  - On subsequent requests, the cached result is checked for staleness. If it is stale, the aggregations are run and the new result is cached to disk.
  - Otherwise, the cached result is returned.
  
  So running this action manually is not necessary, although it can significantly speed up initial requests. 

  Because these aggregations can return results larger than 16MB, we store them as files instead instead of storing them in the database. You may specify where to store these files by setting the environment variable \`CACHE_DIRECTORY\`. You may also configure the tracker to run the aggregations on start by setting an environment variable \`PRECOMPUTE_ON_START\` to \`1\`.
 
  This action can take hours to complete.

  Registered queries:

  ${keys(diskCaches.cache)
    .map((k) => `- ${capitalize(startCase(k))}`)
    .join("\n")}
`,
};

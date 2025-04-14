import { version, appId } from "config";
import { config } from "dotenv";
import { z } from "zod";

config();

export default {
  url: process.env.MONGO_DB_URI,
};

export const env = z
  .object({
    MONGO_DB_URI: z.string(),
    JWT_SECRET: z.string(),
    REGISTRATION_ENABLED: z.coerce.number().default(0),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    PORT: z.coerce.number().default(3000),
    EMAIL_CALLBACK: z.string(),
    LOG_LEVEL: z.string().default("info"),
    VALIDATOR_QUEUE_COUNT: z.coerce.number().default(1),
    VALIDATOR_BATCH_COUNT: z.coerce.number().default(1),
    VALIDATOR_CONCURRENCY_COUNT: z.coerce.number().default(1),
    CACHE_DIRECTORY: z.string().default(`/var/tmp/${appId}/`),
    PRECOMPUTE_ON_START: z.coerce.number().default(0),
  })
  .parse(process.env);

export const general = {
  version,
  runningSince: new Date().toISOString(),
};

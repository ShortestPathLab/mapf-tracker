import { env } from "env";
import { once } from "lodash";
import { log } from "logging";
import { connect } from "mongoose";

const url = env.MONGO_DB_URI;

export const connectToDatabase = once(async (pool = 2) => {
  log.info(`Connecting to database at ${new URL(url).hostname}`);
  try {
    const connection = await connect(url, {
      maxPoolSize: pool,
    });
    log.info(`Connected to database at ${new URL(url).hostname}`);
    return connection;
  } catch (e) {
    log.error(e, "Cannot connect to the database");
  }
});

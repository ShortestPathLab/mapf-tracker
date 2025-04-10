import { env } from "env";
import { once } from "lodash";
import { log } from "logging";
import { connect } from "mongoose";

const url = env.MONGO_DB_URI;

export const connectToDatabase = once(async (pool = 2) => {
  try {
    const connection = await connect(url, {
      maxPoolSize: pool,
    });
    return connection;
  } catch (e) {
    log.error(e, "Cannot connect to the database");
  }
});

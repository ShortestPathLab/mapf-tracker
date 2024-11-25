import { once } from "lodash";
import { log } from "logging";
import { url } from "models";
import { connect } from "mongoose";

export const connectToDatabase = once(async () => {
  log.info(`Connecting to database at ${new URL(url).hostname}`);
  try {
    const connection = await connect(url, {});
    log.info(`Connected to database at ${new URL(url).hostname}`);
    return connection;
  } catch (e) {
    log.error(e, "Cannot connect to the database");
  }
});

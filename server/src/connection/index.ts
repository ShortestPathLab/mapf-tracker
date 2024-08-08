import { log } from "logging";
import db from "models";
import { once } from "lodash";

export const connectToDatabase = once(async () => {
  try {
    const connection = await db.mongoose.connect(db.url, {});
    log.info(`Connected to database at ${new URL(db.url).hostname}`);
    return connection;
  } catch (e) {
    log.error(e, "Cannot connect to the database");
  }
});

import { log } from "../logging";
import db from "../models";

export const connectToDatabase = async () => {
  try {
    await db.mongoose.connect(db.url, {});
    log.info(`Connected to database at ${new URL(db.url).hostname}`);
  } catch (e) {
    log.error(e, "Cannot connect to the database");
  }
};

import { config } from "dotenv";

config();

export default {
  url: process.env.MONGO_DB_URI,
};

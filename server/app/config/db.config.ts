import { config } from "dotenv";

config();

export default {
  url:
    process.env.MONGO_DB_URI ||
    "mongodb://dev:isfuhewyug372j4u@118.138.234.90:8987/test?directConnection=true&authSource=admin",
};

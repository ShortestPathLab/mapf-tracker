import { randomBytes } from "crypto";
import { addMonths } from "date-fns";
import { log } from "logging";
import { SubmissionKey } from "models";

export async function createSubmissionKey(requestId: string) {
  log.info("Creating API key");
  const apiKey = randomBytes(16).toString("hex");
  const creationDate = new Date();
  const expirationDate = addMonths(creationDate, 1);
  await new SubmissionKey({
    request_id: requestId,
    creationDate,
    expirationDate,
    api_key: apiKey,
  }).save();
  return apiKey;
}

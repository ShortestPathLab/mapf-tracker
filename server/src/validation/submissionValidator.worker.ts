import { SandboxedJob } from "bullmq";
import { connectToDatabase } from "../connection";
import { log, setContext } from "../logging";
import { Map, OngoingSubmission, Scenario } from "../models";
import { nanoid } from "nanoid";
import { SubmissionValidatorData } from "./SubmissionValidatorData";
import { validate } from "validator";
import { every } from "lodash";

const id = nanoid(6);

export default async (job: SandboxedJob<SubmissionValidatorData>) => {
  setContext(`Validation Worker ${id}`);
  log.info("Received job", job);
  try {
    await connectToDatabase();

    const { apiKey, mapId, scenarioId } = job.data;

    const submission = await OngoingSubmission.find({
      apiKey,
      mapId,
      scenarioId,
    });
    if (every(submission, (c) => c.validated)) {
      log.info("Submission already validated");
      return;
    }
    const errors = [];

    const scenario = await Scenario.findById(scenarioId);
    const map = await Map.findById(scenarioId);

    // validate({

    //   onError: (c) => {
    //     errors.push(c);
    //   return true
    //   },
    // });
  } catch (e) {
    log.error(e);
  }
};

export const url = import.meta.path;

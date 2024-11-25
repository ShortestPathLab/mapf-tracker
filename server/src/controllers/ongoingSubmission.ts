import { run } from "aggregations";
import { stage as updateSubmissionsWithOngoingSubmissions } from "aggregations/stages/updateSubmissionsWithOngoingSubmissions";
import { randomUUIDv7 } from "bun";
import { map, now, omitBy, pick } from "lodash";
import { context } from "logging";
import { OngoingSubmission } from "models";
import { set } from "models/PipelineStatus";
import { Types } from "mongoose";
import { queryClient, route } from "query";
import { usingWorkerTask } from "queue/usingWorker";
import { TicketPool, withTicket, ResultTicketStatus } from "utils/ticket";
import { createSubmissionValidator } from "validation/createSubmissionValidator";
import {
  apiKeySchema,
  getKey,
  path,
  SubmissionRequestValidatorWorkerResult,
} from "validation/submissionRequestValidatorWorker";
import { z } from "zod";

const ongoingSubmissionTickets: TicketPool = { tickets: {} };

const withOngoingSubmissionTicket = withTicket(ongoingSubmissionTickets);

const log = context("Submission Controller");

const { add } = await createSubmissionValidator({ workerCount: 32 });

// ─── Query Handlers ──────────────────────────────────────────────────────────

const query = queryClient(OngoingSubmission);

/**
 * Get all submissions
 */
export const findAll = query();

/**
 * Find a submission using id
 */
export const findById = query(z.object({ id: z.string() }), ({ id }) => ({
  _id: new Types.ObjectId(id),
}));

/**
 * Find all OngoingSubmission entries with a given api_key
 */
export const findByApiKey = query(
  z.object({ apiKey: z.string() }),
  ({ apiKey }) => ({ apiKey }),
  async (docs) =>
    map(docs, (d) =>
      pick(d.toJSON(), [
        "id",
        "createdAt",
        "lowerBound",
        "cost",
        "instance",
        "apiKey",
        "updatedAt",
        "validation",
      ])
    )
);

/**
 * Delete by id
 */
export const deleteById = query(
  z.object({ id: z.string() }),
  ({ id }) => new Types.ObjectId(id),
  async (docs) => {
    for (const d of docs) await d.deleteOne();
    return { count: 1 };
  }
);

// ─── Submission Handlers ─────────────────────────────────────────────────────

export const finalise = route(
  z
    .object({
      key: apiKeySchema,
    })
    .transform(({ key }, ctx) => getKey(key, ctx)),
  async (data) => {
    await data.updateOne({ status: { type: "submitted" } });
    run(updateSubmissionsWithOngoingSubmissions, undefined, {
      onProgress: (args) => set(args.stage, args),
    });
  }
);

const validateSubmissionRequestAsync = usingWorkerTask<
  unknown,
  SubmissionRequestValidatorWorkerResult
>(() => new Worker(path));

const processSubmission = async (d: unknown): Promise<ResultTicketStatus> => {
  log.info("Validating submission with schema...");
  const result = await validateSubmissionRequestAsync(d);
  if ("ids" in result) {
    log.info(`Received ${result.ids.length} submissions`);
    for (const { apiKey, submissionId } of result.ids) {
      add({ apiKey, submissionId });
    }
    return { status: "done", result: { count: result.ids.length } };
  } else {
    log.info("Submission did not parse schema validation", result.error);
    return { status: "error", error: result.error };
  }
};

export const status = route(
  z.object({ ticket: z.string() }),
  async ({ ticket }) =>
    ongoingSubmissionTickets[ticket] || { status: "unknown" }
);

export const create = route(z.any(), async (d) => {
  const key = randomUUIDv7();
  withOngoingSubmissionTicket(key, () => processSubmission(d));
  return { message: "submission received", ticket: key };
});

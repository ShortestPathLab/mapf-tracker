import { run } from "aggregations";
import { stage as updateSubmissionsWithOngoingSubmissions } from "aggregations/stages/updateSubmissionsWithOngoingSubmissions";
import { randomUUIDv7 } from "bun";
import { RequestHandler } from "express";
import { filter, map, pick, values } from "lodash";
import { context } from "logging";
import { Instance, OngoingSubmission } from "models";
import { set } from "models/PipelineStatus";
import { toString } from "mongodb-aggregate-builder";
import { Types } from "mongoose";
import { queryClient, route } from "query";
import { usingWorkerTask, usingWorkerTaskReusable } from "queue/usingWorker";
import { ResultTicketStatus, createPool } from "utils/ticket";
import { createSubmissionValidator } from "validation/createSubmissionValidator";
import {
  SubmissionRequestValidatorWorkerResult,
  apiKeySchema,
  apiKeyValidationSchema,
  getKey,
  path as validateSubmissionRequestWorkerPath,
} from "validation/submissionRequestValidatorWorker";
import { z } from "zod";
import { estimateSizeAsync } from "./estimateSize.worker";
import {
  SummaryByApiKeyResult,
  path as summaryByApiKeyWorkerPath,
} from "./summaryByApiKey.worker";

const log = context("Submission Controller");

const { add } = await createSubmissionValidator({
  workerCount: +(process.env.VALIDATOR_QUEUE_COUNT || 8),
});

// ─── Query Handlers ──────────────────────────────────────────────────────────

const { query, aggregate } = queryClient(OngoingSubmission);

/**
 * Get all submissions
 */
export const findAll = query();

/**
 * Find a submission using id
 */
export const findById = query(z.object({ id: z.string() }), ({ id }) => [
  {
    _id: new Types.ObjectId(id),
  },
]);

/**
 * Find all OngoingSubmission entries with a given api_key
 */
export const findByApiKey = query(
  z.object({ apiKey: z.string() }),
  ({ apiKey }) => [{ apiKey }],
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

const summaryByApiKeyWorker = usingWorkerTaskReusable<
  unknown,
  SummaryByApiKeyResult
>(() => new Worker(summaryByApiKeyWorkerPath));

export const summaryByApiKey: RequestHandler<
  {},
  unknown,
  { apiKey: string }
> = async (req, res) => {
  res.json(await summaryByApiKeyWorker(req.params));
};

const joinedData = "joinedData";

export const findByScenario = aggregate(
  z.object({ apiKey: z.string(), scenario: z.string() }),
  ({ apiKey, scenario }, p) =>
    p
      .match({ apiKey })
      .lookup(Instance.collection.collectionName, "instance", "_id", joinedData)
      .match({
        [`${joinedData}.scen_id`]: new Types.ObjectId(scenario),
      })
      .addFields({ ...toString("_id", "id") })
      .project({ [joinedData]: 0 }),
  async (docs) => {
    return map(docs, (d) =>
      pick(d, [
        "id",
        "createdAt",
        "lowerBound",
        "cost",
        "instance",
        "apiKey",
        "updatedAt",
        "validation",
      ])
    );
  }
);

export const instanceByApiKey = undefined;

/**
 * Delete by id
 * TODO: FIX BEFORE LAUNCH Require auth or api key
 */
export const deleteById = route(
  z.object({
    id: z
      .string()
      .or(z.string().array())
      .transform((c) => (typeof c === "string" ? [c] : c)),
  }),
  async ({ id }) => {
    const out = await OngoingSubmission.deleteMany({
      _id: { $in: id },
    });

    return { count: out.deletedCount };
  }
);

/**
 * Delete by api key
 */
export const deleteByApiKey = route(
  z.object({ apiKey: z.string() }),
  async ({ apiKey }) => {
    const out = await OngoingSubmission.deleteMany({ apiKey });
    return { count: out.deletedCount };
  },
  { source: "params" }
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
  },
  { source: "params" }
);

const validateSubmissionRequestAsync = usingWorkerTaskReusable<
  unknown,
  SubmissionRequestValidatorWorkerResult
>(() => new Worker(validateSubmissionRequestWorkerPath));

const processSubmission = async (
  d: unknown,
  apiKey: string
): Promise<ResultTicketStatus> => {
  log.info("Validating submission with schema...");
  const result = await validateSubmissionRequestAsync({ apiKey, data: d });
  if ("ids" in result) {
    log.info(`Received ${result.ids.length} submissions`);
    add(result.ids);
    return {
      status: "done",
      message: "Submission received, we will begin automated validation soon.",
      result: { count: result.ids.length },
    };
  } else {
    log.info("Submission did not pass schema validation", result.error);
    return { status: "error", error: result.error };
  }
};

const submissionTickets = createPool<{
  apiKey: string;
  label?: string;
  size?: number;
}>();

export const status = route(
  z.object({ ticket: z.string() }),
  async ({ ticket }) =>
    submissionTickets.pool.tickets[ticket] || { status: "unknown" }
);

export const statusByApiKey = route(
  z.object({ apiKey: z.string() }),
  async ({ apiKey }) =>
    filter(values(submissionTickets.pool.tickets), (c) => c.apiKey === apiKey),
  { source: "params" }
);

export const create = route(z.any(), async (d, req) => {
  const { apiKey, label } = await z
    .object({ apiKey: apiKeyValidationSchema, label: z.string().optional() })
    .parseAsync(req.params);
  const key = randomUUIDv7();
  submissionTickets.withTicket(
    key,
    () => processSubmission(d, apiKey.api_key!),
    {
      apiKey: apiKey.api_key!,
      size: await estimateSizeAsync(d),
      label: label ?? `Submission ${randomUUIDv7().slice(-6)}`,
    }
  );
  return { message: "submission received", ticket: key };
});

export async function restore() {
  // Remove unfinished jobs
  await OngoingSubmission.aggregate([
    { $match: { "validation.outcome": "queued" } },
    { $addFields: { "validation.outcome": null } },
    {
      $merge: {
        into: OngoingSubmission.collection.name,
        whenMatched: "replace",
      },
    },
  ]);
  // Re-queue unfinished jobs
  const docs = await OngoingSubmission.find({
    "validation.isValidationRun": { $ne: true },
  });
  add(
    docs.map((b) => ({
      apiKey: b.apiKey,
      submissionId: b._id.toString(),
    }))
  );
}

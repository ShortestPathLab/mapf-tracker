import { run } from "aggregations";
import { stage as updateSubmissionsWithOngoingSubmissions } from "aggregations/stages/updateSubmissionsWithOngoingSubmissions";
import { randomUUIDv7 } from "bun";
import { RequestHandler } from "express";
import {
  chain as _,
  ceil,
  chain,
  filter,
  map,
  mergeWith,
  pick,
  reduce,
  values,
} from "lodash";
import { context } from "logging";
import { Instance, instances, OngoingSubmission } from "models";
import { set } from "models/PipelineStatus";
import { AggregateBuilder, toString } from "mongodb-aggregate-builder";
import { Types } from "mongoose";
import { cached, createCache, queryClient, route } from "query";
import { usingWorkerTaskReusable } from "queue/usingWorker";
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
  CHUNK,
  SummaryByApiKeyResult,
  path as summaryByApiKeyWorkerPath,
} from "./summaryByApiKey.worker";
import { generateIndexes } from "./generateIndexes";

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

export const summaryPageCountByApiKeyGeneral = aggregate(
  undefined,
  z.object({ apiKey: z.string() }),
  ({ apiKey }, p) => p.match({ apiKey }).count("count"),
  async (p: [{ count: number }]) => ceil((p[0]?.count ?? 0) / CHUNK),
);

const summaryByApiKeyWorker = usingWorkerTaskReusable<
  unknown,
  SummaryByApiKeyResult
>(() => new Worker(summaryByApiKeyWorkerPath));


export const summaryByApiKey = cached(
  [],
  z.unknown(),
  (params) => summaryByApiKeyWorker(params),
  "params",
  { maxAge: 10 * 1000, maxSize: 1000 }
)

export const summaryByApiKeyGeneral = aggregate(
  undefined,
  z.object({ apiKey: z.string() }),
  ({ apiKey }, p) =>
    p
      .match({ apiKey })
      .project({
        "validation.outcome": { $ifNull: ["$validation.outcome", "running"] },
      })
      .group({ _id: "$validation.outcome", count: { $sum: 1 } }),
  async (p: { _id: string; count: number }[]) =>
    reduce(p, (prev, { _id, count }) => ({ ...prev, [_id]: count }), {}),
);

export const findByScenario = cached(
  [OngoingSubmission, Instance],
  z.object({ apiKey: z.string(), scenario: z.string() }),
  async ({ apiKey, scenario }) => {
    const indexes = await generateIndexes();
    const ids = await Instance.aggregate(
      new AggregateBuilder()
        .match({ scen_id: new Types.ObjectId(scenario) })
        .project({ _id: 1 })
        .build(),
    );
    const result = await OngoingSubmission.aggregate(
      new AggregateBuilder()
        .match({
          instance: { $in: ids.map((c) => new Types.ObjectId(c._id)) },
          apiKey,
        })
        .addFields(toString("_id", "id"))
        .project({
          createAt: 1,
          lowerBound: 1,
          cost: 1,
          instance: 1,
          apiKey: 1,
          updatedAt: 1,
          validation: 1,
          id: 1,
        })
        .build(),
    );
    return result.map((r) => ({
      ...r,
      instance: pick(indexes.instances[r.instance], ["_id", "solution_cost", "lower_cost"])
    }))
  },
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
  },
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
  { source: "params" },
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
  { source: "params" },
);

const validateSubmissionRequestAsync = usingWorkerTaskReusable<
  unknown,
  SubmissionRequestValidatorWorkerResult
>(() => new Worker(validateSubmissionRequestWorkerPath));

const processSubmission = async (
  d: unknown,
  apiKey: string,
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
    submissionTickets.pool.tickets[ticket] || { status: "unknown" },
);

export const statusByApiKey = route(
  z.object({ apiKey: z.string() }),
  async ({ apiKey }) =>
    filter(values(submissionTickets.pool.tickets), (c) => c.apiKey === apiKey),

  { source: "params" },
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
    },
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
    })),
  );
}

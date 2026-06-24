import { run } from "aggregations";
import { stage as updateSubmissionsWithOngoingSubmissions } from "aggregations/stages/updateSubmissionsWithOngoingSubmissions";
import { randomUUIDv7 } from "bun";
import type { Context } from "elysia";
import { Elysia } from "elysia";
import { ceil, filter, pick, reduce, values } from "lodash";
import { context } from "logging";
import { Instance, OngoingSubmission } from "models";
import { set } from "models/PipelineStatus";
import { AggregateBuilder, toString } from "mongodb-aggregate-builder";
import { Types } from "mongoose";
import { cached, queryClient } from "query";
import { usingWorkerTaskReusable } from "queue/usingWorker";
import { generateIndexes } from "utils/generateIndexes";
import { ResultTicketStatus, createPool } from "utils/ticket";
import { createSubmissionValidator } from "validation/createSubmissionValidator";
import {
  SubmissionRequestValidatorWorkerResult,
  apiKeySchema,
  apiKeyValidationSchema,
  getKey,
  path as validateSubmissionRequestWorkerPath,
} from "validation/submissionRequestValidatorWorker";
import { estimateSizeAsync } from "workers/estimateSize.worker";
import {
  CHUNK,
  SummaryByApiKeyResult,
  path as summaryByApiKeyWorkerPath,
} from "workers/summaryByApiKey.worker";
import { z } from "zod";

const log = context("Submission Controller");

const { add } = await createSubmissionValidator({
  workerCount: +(process.env.VALIDATOR_QUEUE_COUNT || 8),
});

// ─── Query Handlers ──────────────────────────────────────────────────────────

const { query, aggregate } = queryClient(OngoingSubmission);




const summaryByApiKeyWorker = usingWorkerTaskReusable<
  unknown,
  SummaryByApiKeyResult
>(() => new Worker(summaryByApiKeyWorkerPath));






// ─── Submission Handlers ─────────────────────────────────────────────────────


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




/** Re-queue submission validation jobs left unfinished on startup. */
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

// Static-prefixed routes registered before the dynamic `/:apiKey` (GET/DELETE)
// so they aren't shadowed. Optional `:page?`/`:label?` are two routes each.
export const ongoingSubmissionRoutes = new Elysia({
  prefix: "/api/ongoing_submission",
})
  .get("/", query())
  .get("/id/:id", query(({ params }) => [
    {
      _id: new Types.ObjectId(params.id),
    },
  ]))
  .post("/delete", (async ({ body }: Context) => {
    const { id } = z
      .object({
        id: z
          .string()
          .or(z.string().array())
          .transform((c) => (typeof c === "string" ? [c] : c)),
      })
      .parse(body);
    const out = await OngoingSubmission.deleteMany({
      _id: { $in: id },
    });
    return { count: out.deletedCount };
  }))
  .get("/status/:apiKey", (async ({ params }: Context) => filter(
    values(submissionTickets.pool.tickets),
    (c) => c.apiKey === params.apiKey
  )))
  .post("/status", (async ({ body }: Context) => {
    const { ticket } = z.object({ ticket: z.string() }).parse(body);
    return submissionTickets.pool.tickets[ticket] || { status: "unknown" };
  }))
  .get("/summary-pagecount/:apiKey", aggregate(
    ({ params }, p) => p.match({ apiKey: params.apiKey }).count("count"),
    {
      handler: async (p: [{ count: number; }]) => ceil((p[0]?.count ?? 0) / CHUNK),
    }
  ))
  .get("/summary/:apiKey", cached(
    ({ params }: Context) => summaryByApiKeyWorker(params),
    { cacheKey: (ctx) => ctx.params, maxAge: 10 * 1000, maxSize: 1000 }
  ))
  .get("/summary/:apiKey/:page", cached(
    ({ params }: Context) => summaryByApiKeyWorker(params),
    { cacheKey: (ctx) => ctx.params, maxAge: 10 * 1000, maxSize: 1000 }
  ))
  .get("/scenario/:apiKey/:scenario", cached(
    async ({ params }: Context) => {
      const { apiKey, scenario } = params as { apiKey: string; scenario: string; };
      const indexes = await generateIndexes();
      const ids = await Instance.aggregate(
        new AggregateBuilder()
          .match({ scen_id: new Types.ObjectId(scenario) })
          .project({ _id: 1 })
          .build()
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
          .build()
      );
      return result.map((r) => ({
        ...r,
        instance: pick(indexes.instances[r.instance], ["_id", "solution_cost", "lower_cost"])
      }));
    },
    { watch: [OngoingSubmission, Instance] }
  ))
  .get("/finalise/:key", (async ({ params }: Context) => {
    const data = await z
      .object({ key: apiKeySchema })
      .transform(({ key }, ctx) => getKey(key, ctx))
      .parseAsync(params);
    await data.updateOne({ status: { type: "submitted" } });
    run(updateSubmissionsWithOngoingSubmissions, undefined, {
      onProgress: (args) => set(args.stage, args),
    });
    return { status: "submitted" };
  }))
  .post("/create/:apiKey", (async ({ body, params }: Context) => {
    const { apiKey, label } = await z
      .object({ apiKey: apiKeyValidationSchema, label: z.string().optional() })
      .parseAsync(params);
    const key = randomUUIDv7();
    submissionTickets.withTicket(
      key,
      () => processSubmission(body, apiKey.api_key!),
      {
        apiKey: apiKey.api_key!,
        size: await estimateSizeAsync(body),
        label: label ?? `Submission ${randomUUIDv7().slice(-6)}`,
      }
    );
    return { message: "submission received", ticket: key };
  }))
  .post("/create/:apiKey/:label", (async ({ body, params }: Context) => {
    const { apiKey, label } = await z
      .object({ apiKey: apiKeyValidationSchema, label: z.string().optional() })
      .parseAsync(params);
    const key = randomUUIDv7();
    submissionTickets.withTicket(
      key,
      () => processSubmission(body, apiKey.api_key!),
      {
        apiKey: apiKey.api_key!,
        size: await estimateSizeAsync(body),
        label: label ?? `Submission ${randomUUIDv7().slice(-6)}`,
      }
    );
    return { message: "submission received", ticket: key };
  }))
  .get("/:apiKey", aggregate(
    ({ params }, p) => p
      .match({ apiKey: params.apiKey })
      .project({
        "validation.outcome": { $ifNull: ["$validation.outcome", "running"] },
      })
      .group({ _id: "$validation.outcome", count: { $sum: 1 } }),
    {
      handler: async (
        p: { _id: string; count: number }[],
      ): Promise<Record<string, number>> =>
        reduce(
          p,
          (prev, { _id, count }) => ({ ...prev, [_id]: count }),
          {} as Record<string, number>,
        ),
    }
  ))
  .delete("/:apiKey", (async ({ params }: Context) => {
    const out = await OngoingSubmission.deleteMany({ apiKey: params.apiKey });
    return { count: out.deletedCount };
  }));

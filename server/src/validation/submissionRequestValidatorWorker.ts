import { connectToDatabase } from "connection";
import { chain, flatten, now, omit, truncate, values } from "lodash";
import { usingTaskMessageHandler } from "queue/usingWorker";
import { encode } from "validator";
import { RefinementCtx, z } from "zod";
import { Map, OngoingSubmission, Scenario, SubmissionKey } from "../models";
import { memoizeAsync } from "../utils/memoizeAsync";
import { waitMap } from "../utils/waitMap";
import { fatal } from "../validation/zod";
import Validator, {
  ValidationError,
  ValidationSchema,
} from "fastest-validator";
import { context } from "logging";
import { map } from "promise-tools";
import { findInstance } from "./findInstance";

const log = context("Schema Validator");

export const getKey = async (
  api_key: string | undefined,
  ctx: RefinementCtx
) => {
  const key = await SubmissionKey.findOne({ api_key });
  if (!key) return fatal(ctx, "API key invalid");
  if (key?.status?.type === "submitted")
    return fatal(ctx, "API key already submitted");
  if (new Date() > (key?.expirationDate ?? 0))
    return fatal(ctx, "API key expired");
  return key;
};

export const apiKeySchema = z.string().length(32, "Should be 32 characters");

export const apiKeyValidationSchema = z
  .string()
  .length(32, "Should be 32 characters")
  .transform(getKey);

export const pathSchema = (newline: boolean = false) =>
  z
    .string()
    .regex(
      newline ? /^[lruwd0-9\r\n]*$/ : /^[lruwd0-9]*$/,
      "Should only contain `l`, `r`, `u`, `d`, `w`"
    );

const v = new Validator({ haltOnFirstError: true });

export const submissionBaseSchema = z.object({
  skip_validation: z.boolean().default(false).optional(),
  // Instance identification
  map_name: z.string(),
  scen_type: z.string(),
  type_id: z.number().int().nonnegative(),
  //
  lower_cost: z.number().nonnegative().optional(),
  solution_cost: z.number().nonnegative().optional(),
  agent_count: z.number().int().nonnegative().optional(),
  // origin: z.enum(["bottom-left", "top-left"]).default("bottom-left").optional(),
  flip_up_down: z.boolean().default(false).optional(),
  solution_plan: z
    .union([
      // Accept newline delimited solution list
      pathSchema(true),
      // Accept solution list
      pathSchema(false).array(),
    ])
    .default([])
    .optional(),
});

type One = {
  skip_validation: boolean;
  map_name: string;
  scen_type: string;
  type_id: number;
  lower_cost?: number;
  solution_cost?: number;
  agent_count?: number | undefined;
  agents?: number;
  flip_up_down?: boolean;
  solution_plan: string | string[];
  instance?: string;
};

const base = {
  skip_validation: { type: "boolean", default: false, optional: true },
  map_name: "string",
  scen_type: "string",
  type_id: { type: "number", int: true, nonnegative: true, optional: false },
  lower_cost: { type: "number", nonnegative: true, optional: true },
  solution_cost: { type: "number", nonnegative: true, optional: true },
  agent_count: { type: "number", int: true, nonnegative: true, optional: true },
  flip_up_down: { type: "boolean", default: false, optional: true },
  solution_plan: [
    {
      type: "string",
      optional: true,
      default: "",
      pattern: /^[lruwd0-9\r\n]*$/,
    },
    {
      type: "array",
      optional: true,
      default: [],
      items: { type: "string", pattern: /^[lruwd0-9]*$/ },
    },
  ],
} satisfies ValidationSchema<One>;

const findMap = memoizeAsync((a) => Map.findOne(a, { _id: 1 }), {
  cacheKey: JSON.stringify,
});
const findScenario = memoizeAsync((a) => Scenario.findOne(a, { _id: 1 }), {
  cacheKey: JSON.stringify,
});

export const transformOne = async (v: One) => {
  // ─── Coerce Solution Plan ────────────────────────────────────────────
  v.solution_plan =
    typeof v.solution_plan === "string"
      ? v.solution_plan.split(/\r\n|\r|\n/)
      : v.solution_plan ?? [];
  // ─── Coerce Agent Count ──────────────────────────────────────────────
  v.agent_count ??= v.agents;
  // ─── Coerce Agent Count ──────────────────────────────────────────────
  const inferredAgentCount = v.solution_plan.length;
  if (
    v.agent_count &&
    v.agent_count !== inferredAgentCount &&
    !v.skip_validation
  )
    throw `Agent count mismatch, expected ${v.agent_count} got ${inferredAgentCount}`;
  v.agent_count = v.agent_count ?? inferredAgentCount;
  // ─── Validate Instance Existence ─────────────────────────────────────
  const map = await findMap({ map_name: v.map_name });
  if (!map) throw "Map name invalid";
  const scenario = await findScenario({
    map_id: map._id,
    scen_type: v.scen_type,
    type_id: v.type_id,
  });
  if (!scenario) throw "Scenario not found";
  const instance = await findInstance({
    agents: v.agent_count,
    scen_id: scenario._id,
  });
  if (!instance) throw "Instance not found";
  v.instance = instance._id.toString();
  if (v.skip_validation) return v;
  // ─── Coerce Solution Plan ────────────────────────────────────────────
  v.solution_plan = v.solution_plan.map(encode);
  v.solution_plan = v.solution_plan.map((s) =>
    s.replace(/u/g, "t").replace(/d/g, "u").replace(/t/g, "d")
  );
  return v;
};

const submitOne = async (apiKey: string, data: One | One[]) => {
  const id = { apiKey };
  const result = await OngoingSubmission.collection.insertMany(
    (data instanceof Array ? data : [data]).map(
      (data) =>
        new OngoingSubmission({
          ...id,
          instance: data.instance,
          lowerBound: data.lower_cost,
          cost: data.solution_cost,
          solutions: data.solution_plan,
          options: { skipValidation: data.skip_validation },
        })
    )
  );

  return values(result.insertedIds).map((d) => ({
    submissionId: d.toString(),
    ...id,
  }));
};

const handlers = [
  {
    name: "Single instance submission",
    schema: v.compile(base),
    handler: submitOne,
    transformer: transformOne,
  },
  {
    name: "Batch submission",
    schema: v.compile({
      $$root: true,
      type: "array",
      items: { type: "object", props: base },
    }),
    handler: submitOne,
    transformer: (vs: One[]) => map(vs, transformOne),
  },
] as const;

export async function run({
  data: d,
  apiKey,
}: SubmissionRequestValidatorWorkerParams) {
  try {
    await connectToDatabase();
    for (const { schema, handler, transformer } of handlers) {
      const result = schema(d);
      if (result === true) {
        log.info("Schema validation complete");
        const transformed = await transformer(d as One & One[]);
        log.info("Transform complete");
        const output = await handler(apiKey, transformed as any);
        log.info("Transform complete");
        return { ids: output, error: undefined };
      }
    }
    return {
      error: {
        description: "Does not match any schema.",
        attempts: handlers.map(({ name, schema }) => {
          const error = schema(d) as ValidationError[];
          return {
            name,
            error: error.map((e) => ({
              ...e,
              actual: truncate(JSON.stringify(e.actual), { length: 1024 }),
            })),
          };
        }),
      },
    };
  } catch (e) {
    return { error: `${e}` };
  }
}

export const path = import.meta.path;

export type SubmissionRequestValidatorWorkerParams = {
  apiKey: string;
  data: unknown;
};

export type SubmissionRequestValidatorWorkerResult =
  | {
      ids: {
        submissionId: string;
        apiKey: string;
      }[];
    }
  | {
      error: any;
    };

if (!Bun.isMainThread) {
  self.onmessage = usingTaskMessageHandler<
    SubmissionRequestValidatorWorkerParams,
    SubmissionRequestValidatorWorkerResult
  >(run);
}

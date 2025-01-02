import { connectToDatabase } from "connection";
import { flatten } from "lodash";
import { usingTaskMessageHandler } from "queue/usingWorker";
import { encode } from "validator";
import { RefinementCtx, z } from "zod";
import {
  Instance,
  Map,
  OngoingSubmission,
  Scenario,
  SubmissionKey,
} from "../models";
import { memoizeAsync } from "../utils/memoizeAsync";
import { waitMap } from "../utils/waitMap";
import { fatal } from "../validation/zod";

export const getKey = async (
  api_key: string | undefined,
  ctx: RefinementCtx
) => {
  const key = await SubmissionKey.findOne({ api_key });
  if (!key) return fatal(ctx, "API key invalid");
  if (key.status.type === "submitted")
    return fatal(ctx, "API key already submitted");
  if (new Date() > key.expirationDate) return fatal(ctx, "API key expired");
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

const findInstance = memoizeAsync((a) => Instance.findOne(a), {
  cacheKey: JSON.stringify,
});
const findMap = memoizeAsync((a) => Map.findOne(a), {
  cacheKey: JSON.stringify,
});
const findScenario = memoizeAsync((a) => Scenario.findOne(a), {
  cacheKey: JSON.stringify,
});

export const submissionSchema = submissionBaseSchema
  .transform(({ solution_plan, ...v }) => ({
    ...v,
    solution_plan:
      typeof solution_plan === "string"
        ? solution_plan.split(/\r\n|\r|\n/)
        : solution_plan ?? [],
  }))
  .transform(({ agent_count, ...v }, ctx) => {
    const inferredAgentCount = v.solution_plan.length;
    if (agent_count && agent_count !== inferredAgentCount)
      fatal(
        ctx,
        `Agent count mismatch, expected ${agent_count} got ${inferredAgentCount}`
      );
    return { ...v, agent_count: inferredAgentCount };
  })
  .transform(async ({ map_name, ...v }, ctx) => {
    const map = await findMap({ map_name });
    if (!map) return fatal(ctx, "Map name invalid");
    const scenario = await findScenario({
      map_id: map.id,
      scen_type: v.scen_type,
      type_id: v.type_id,
    });
    const instance = await findInstance({
      agents: v.agent_count,
      scen_id: scenario.id,
      map_id: map.id,
    });
    if (!scenario) return fatal(ctx, "Scenario not found");
    return { ...v, instance, scenario, map };
  })
  .transform(({ solution_plan, ...v }) => ({
    ...v,
    solution_plan: solution_plan.map(encode),
  }))
  .transform(async ({ solution_plan, flip_up_down, ...v }) => {
    if (flip_up_down) {
      return {
        ...v,
        solution_plan: solution_plan.map((s) =>
          s.replace(/u/g, "t").replace(/d/g, "u").replace(/t/g, "d")
        ),
      };
    }
    return { ...v, solution_plan };
  });

const submitOne = async (
  apiKey: string,
  data: z.infer<typeof submissionSchema>
) => {
  const id = { apiKey };
  const doc = await new OngoingSubmission({
    ...id,
    instance: data.instance.id,
    lowerBound: data.lower_cost,
    cost: data.solution_cost,
    solutions: data.solution_plan,
    options: { skipValidation: data.skip_validation },
  }).save();

  return [{ ...id, submissionId: doc.id }];
};

const submitBatch = async (
  apiKey: string,
  data: z.infer<typeof submissionSchema>[]
) => flatten(await waitMap(data, (d) => submitOne(apiKey, d)));

const handlers = [
  {
    name: "Single instance submission",
    schema: submissionBaseSchema,
    handler: submitOne,
    transformer: submissionSchema,
  },
  {
    name: "Batch submission",
    schema: submissionBaseSchema.array(),
    handler: submitBatch,
    transformer: submissionSchema.array(),
  },
] as const;

export async function run({
  data: d,
  apiKey,
}: SubmissionRequestValidatorWorkerParams) {
  try {
    await connectToDatabase();
    for (const { schema, handler, transformer } of handlers) {
      const { success, data } = schema.safeParse(d);
      if (success) {
        const transformed = await transformer.parseAsync(data);
        const output = await handler(apiKey, transformed as any);
        return { ids: output };
      }
    }
    return {
      error: {
        description: "Does not match any schema.",
        attempts: handlers.map(({ name, schema }) => {
          const { error } = schema.safeParse(d);
          return { name, error: error.format() };
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

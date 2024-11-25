import { usingMessageHandler } from "queue/usingWorker";
import {
  Instance,
  Map,
  OngoingSubmission,
  Scenario,
  SubmissionKey,
} from "../models";
import { fatal } from "../validation/zod";
import { encode } from "validator";
import { RefinementCtx, z } from "zod";
import { flatten } from "lodash";
import { connectToDatabase } from "connection";

export const getKey = async (
  api_key: string | undefined,
  ctx: RefinementCtx
) => {
  const key = await SubmissionKey.findOne({ api_key });
  if (!key) return fatal(ctx, "API key invalid");
  if (new Date() > key.expirationDate) return fatal(ctx, "API key expired");
  return key;
};

export const apiKeySchema = z.string().length(32, "Should be 32 characters");

export const pathSchema = (newline: boolean = false) =>
  z
    .string()
    .regex(
      newline ? /^([lrudw\n]|[0-9])*$/ : /^([lrudw]|[0-9])*$/,
      "Should only contain `l`, `r`, `u`, `d`, `w`"
    );

export const submissionBaseSchema = z.object({
  api_key: apiKeySchema,
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
    .optional(),
});

export const submissionSchema = submissionBaseSchema
  .transform(async ({ api_key, ...v }, ctx) => ({
    ...v,
    key: await getKey(api_key, ctx),
  }))
  .transform(({ solution_plan, ...v }) => ({
    ...v,
    solution_plan:
      typeof solution_plan === "string"
        ? solution_plan.split("\n")
        : solution_plan,
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
    const map = await Map.findOne({ map_name });
    if (!map) return fatal(ctx, "Map name invalid");
    const scenario = await Scenario.findOne({
      map_id: map.id,
      scen_type: v.scen_type,
      type_id: v.type_id,
    });
    const instance = await Instance.findOne({
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

export async function waitMap<T, U>(
  t: Iterable<T>,
  f: (t: T, i: number) => Promise<U>
) {
  const out: U[] = [];
  let i = 0;
  for (const item of t) {
    out.push(await f(item, i));
    i++;
  }
  return out;
}

const submitOne = async (data: z.infer<typeof submissionSchema>) => {
  const id = { apiKey: data.key.api_key };
  const doc = await new OngoingSubmission({
    ...id,
    instance: data.instance.id,
    lowerBound: data.lower_cost,
    cost: data.solution_cost,
    solutions: data.solution_plan,
  }).save();

  return [{ ...id, submissionId: doc.id }];
};

const submitBatch = async (data: z.infer<typeof submissionSchema>[]) =>
  flatten(await waitMap(data, submitOne));

const handlers = [
  {
    schema: submissionBaseSchema,
    handler: submitOne,
    transformer: submissionSchema,
  },
  {
    schema: submissionBaseSchema.array(),
    handler: submitBatch,
    transformer: submissionSchema.array(),
  },
] as const;

export async function run(d: unknown) {
  await connectToDatabase();
  try {
    for (const { schema, handler, transformer } of handlers) {
      const { success, data } = schema.safeParse(d);
      if (success) {
        const transformed = await transformer.parseAsync(data);
        const output = await handler(transformed as any);
        return { ids: output };
      }
    }
    return {
      error: {
        description: "Does not match any schema.",
        attempts: handlers.map(({ schema }) => {
          const { error } = schema.safeParse(d);
          console.log(error.format());
          return error.format();
        }),
      },
    };
  } catch (e) {
    return { error: `${e}` };
  }
}

export const path = import.meta.path;

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
  self.onmessage = usingMessageHandler<
    unknown,
    SubmissionRequestValidatorWorkerResult
  >(({ data }) => run(data));
}

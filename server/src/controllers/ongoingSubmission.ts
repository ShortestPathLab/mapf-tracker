import { run } from "aggregations";
import { stage as updateSubmissionsWithOngoingSubmissions } from "aggregations/stages/updateSubmissionsWithOngoingSubmissions";
import { getPort } from "getPort";
import { isNull, isUndefined } from "lodash";
import { log } from "logging";
import { Infer, Map, OngoingSubmission, Scenario, SubmissionKey } from "models";
import { set } from "models/PipelineStatus";
import { Types } from "mongoose";
import { queryClient, route, text } from "query";
import { createSubmissionValidator } from "validation/createSubmissionValidator";
import { fatal } from "validation/zod";
import z, { RefinementCtx } from "zod";

const { add } = await createSubmissionValidator({ workerCount: 8 });

type Data = {
  map: Infer<typeof Map>;
  scenario: Infer<typeof Scenario>;
};

const getScenario = async ({ scenario, map }: Data) =>
  await text(
    `http://localhost:${getPort()}/res/scens/${map.map_name}-${
      scenario.scen_type
    }-${scenario.type_id}.scen`
  );

const getMap = async ({ map }: Data) =>
  await text(`http://localhost:${getPort()}/res/maps/${map.map_name}.map`);

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
  ({ apiKey }) => ({ apiKey })
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

const getKey = async (api_key: string | undefined, ctx: RefinementCtx) => {
  const key = await SubmissionKey.findOne({ api_key });
  if (!key) return fatal(ctx, "API key invalid");
  if (new Date() > key.expirationDate) return fatal(ctx, "API key expired");
  return key;
};

const apiKeySchema = {
  api_key: z.string().length(32, "Should be 32 characters"),
};

const instanceSchema = {
  lower_cost: z.number().nonnegative(),
  solution_cost: z.number().nonnegative(),
  map_name: z.string(),
  scen_type: z.string(),
  type_id: z.number().int().nonnegative(),
};

const pathSchema = z
  .string()
  .regex(/^([lrudw]|[0-9])*$/, "Should only contain `l`, `r`, `u`, `d`, `w`");

const submissionSchema = z
  .object({
    ...apiKeySchema,
    ...instanceSchema,
    agent_count_intent: z.number().int().positive(),
    index: z.number().int().nonnegative(),
    solution_path: pathSchema.optional(),
    solution_plan: pathSchema.optional(),
  })
  .transform(
    /**
     * Legacy CSV format compat. In the legacy CSV format, `solution_path` is named `solution_plan`.
     */
    async ({ solution_path, solution_plan, ...v }, ctx) => {
      const plan = solution_path ?? solution_plan;
      if (isUndefined(plan) || isNull(plan))
        fatal(ctx, "Solution plan not defined");
      return { ...v, solution_path: plan };
    }
  )
  .transform(async ({ api_key, ...v }, ctx) => ({
    ...v,
    key: await getKey(api_key, ctx),
  }))
  .transform(async ({ map_name, ...v }, ctx) => {
    const map = await Map.findOne({ map_name });
    if (!map) return fatal(ctx, "Map name invalid");
    return { ...v, map };
  })
  .transform(async (v, ctx) => {
    const scenario = await Scenario.findOne({
      map_id: v.map.id,
      scen_type: v.scen_type,
      type_id: v.type_id,
    });
    if (!scenario) return fatal(ctx, "Scenario not found");
    return { ...v, scenario };
  });

const batchSubmissionSchema = z
  .object({
    ...apiKeySchema,
    ...instanceSchema,
    solutions: z.array(pathSchema),
  })
  .transform(async ({ solutions, ...rest }) =>
    solutions.map((s) =>
      submissionSchema.parse({
        ...rest,
        agent_count_intent: solutions.length,
        solution_path: s,
      })
    )
  );

export const finalise = route(
  z
    .object({
      key: apiKeySchema.api_key,
    })
    .transform(({ key }, ctx) => getKey(key, ctx)),
  async (data) => {
    await data.updateOne({ status: { type: "submitted" } });
    run(updateSubmissionsWithOngoingSubmissions, undefined, {
      onProgress: (args) => set(args.stage, args),
    });
  }
);

const createOne = async (data: z.infer<typeof submissionSchema>) => {
  const id = {
    apiKey: data.key.api_key,
    mapId: data.map.id,
    scenarioId: data.scenario.id,
    agentCountIntent: data.agent_count_intent,
  };
  const doc = await new OngoingSubmission({
    ...id,
    index: data.index,
    lowerCost: data.lower_cost,
    solutionCost: data.solution_cost,
    solutionPath: data.solution_path,
  }).save();
  log.info("Submission received", doc);
  add({
    ...id,
    map: await getMap(data),
    scenario: await getScenario(data),
  });
  return doc.id;
};

/**
 * Create a new submission
 */
export const create = route(submissionSchema, async (data) => ({
  id: await createOne(data),
}));

/**
 * Create multiple submissions
 */
export const createBatch = route(batchSubmissionSchema, async (data) => ({
  ids: await Promise.all(data.map(createOne)),
}));

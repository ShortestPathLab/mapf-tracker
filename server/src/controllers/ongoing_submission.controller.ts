import { Job } from "bullmq";
import { RequestHandler } from "express";
import { getPort } from "getPort";
import { log } from "logging";
import db, { OngoingSubmission } from "models";
import { Map } from "models/Map";
import { Scenario } from "models/Scenario";
import { Document } from "mongoose";
import { Types } from "mongoose";
import { queryClient, text } from "query";
import { createSubmissionValidator } from "validation/createSubmissionValidator";
import { fatal } from "validation/zod";
import z from "zod";

const Map = db.maps;
const Scenario = db.scenarios;
const SubmissionKey = db.submission_keys;

const handler = queryClient(OngoingSubmission);

/**
 * Get all submissions
 */
export const findAll = handler();

/**
 * Find a submission using id
 */
export const findById = handler(z.object({ id: z.string() }), ({ id }) => ({
  _id: new Types.ObjectId(id),
}));

/**
 * Find all OngoingSubmission entries with a given api_key
 */
export const findByApiKey = handler(
  z.object({ apiKey: z.string() }),
  ({ apiKey }) => ({ apiKey })
);

// create a new ongoing submission
const createSubmissionSchema = z
  .object({
    api_key: z.string().length(32, "Should be 32 characters"),
    index: z.number().int().nonnegative(),
    lower_cost: z.number().nonnegative(),
    solution_cost: z.number().nonnegative(),
    map_name: z.string(),
    scen_type: z.string(),
    type_id: z.number().int().nonnegative(),
    agent_count_intent: z.number().int().positive(),
    solution_path: z
      .string()
      .regex(
        /^([lrudw]|[0-9])*$/,
        "Should only contain `l`, `r`, `u`, `d`, `w`"
      ),
  })
  .transform(async ({ api_key, ...v }, ctx) => {
    const key = await SubmissionKey.findOne({ api_key });
    if (!key) return fatal(ctx, "API key invalid");
    if (new Date() > key.expirationDate) return fatal(ctx, "API key expired");
    return { ...v, key };
  })
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

type Data = {
  map: Map;
  scenario: Scenario;
};

const getScenario = async ({ scenario, map }: Data) =>
  await text(
    `http://localhost:${getPort()}/res/scens/${map.map_name}-${
      scenario.scen_type
    }-${scenario.type_id}.scen`
  );

const getMap = async ({ map }: Data) =>
  await text(`http://localhost:${getPort()}/res/maps/${map.map_name}.map`);

const { add } = await createSubmissionValidator({ workerCount: 8 });

export const create: RequestHandler<{}, {}, unknown> = async (
  { body },
  res
) => {
  const { success, data, error } = await createSubmissionSchema.safeParseAsync(
    body
  );
  if (!success) return res.status(400).json(error.format());
  try {
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
    res.json(doc.id);
  } catch (e) {
    log.error(e);
    res.status(500).json({ error: e });
  }
};

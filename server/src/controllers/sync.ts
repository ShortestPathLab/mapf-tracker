import { RequestHandler } from "express";
import { Types } from "mongoose";
import { range } from "lodash";
import {
  Algorithm,
  Infer,
  Instance,
  Map,
  OngoingSubmission,
  Request,
  Scenario,
  SolutionPath,
  Submission,
  SubmissionKey,
} from "models";
import { format } from "date-fns";
import { Document } from "mongoose";
import { createAlgo } from "./user";
import { log } from "logging";

const SCEN_TYPE_IDS = range(1, 26);
const SCEN_TYPES = ["even", "random"];

export const updateProgress: RequestHandler<
  {},
  { message: string },
  { id: string; map_name: string }
> = async (req, res) => {
  try {
    const { id, map_name: mapName } = req.body;

    if (!id || !mapName) {
      return res.status(400).send({ message: "Content cannot be empty!" });
    }

    await sync(id, mapName);

    return res.status(200).send({ message: "Update successful" });
  } catch (err) {
    return res
      .status(400)
      .send({ message: err.message || "An unexpected error occurred." });
  }
};

/**
 * Handler for /api/submit
 */
export const submitHandler: RequestHandler<
  {},
  { message: string },
  { apiKey: string }
> = async (req, res) => {
  try {
    await submit(req.body.apiKey);
    return res.status(200).send({ message: "Update successful" });
  } catch (err) {
    return res
      .status(400)
      .send({ message: err.message || "An unexpected error occurred." });
  }
};

/**
 * Validate and merge a submission with the database
 */
export const submit = async (apiKey?: string) => {
  log.info("Starting sync");
  // Should run in worker (concurrency=1), otherwise race condition
  // TODO: Check if requestId has an algorithm already (if so error)
  // TODO: Check if the submissions are valid
  if (!apiKey) throw new Error("API Key not defined");
  // Create algorithm
  log.info("Creating algorithm");
  const algo = await upsertAlgorithm(apiKey);
  // Find all ongoing submissions with API key
  log.info("Retrieving submissions");
  const { items, maps } = await retrieveSubmissions(apiKey);
  // Run updateSubmission
  log.info("Updating submissions");
  await updateSubmission(algo.id(), items);
  // Run sync
  log.info("Updating benchmarks");
  for (const m of maps) {
    await sync(algo.id(), m);
  }
  log.info("Done");
};

const sync = async (id: string, mapName: string) => {
  const algoId = new Types.ObjectId(id);

  const map = await findMap(mapName);

  const [totalS, totalL] = await processScenarios(map._id);

  await updateMap(map._id, totalS, totalL);
  await updateAlgorithm(algoId);
};

const upsertAlgorithm = async (apiKey: string) => {
  // Algorithms and Submission Requests have a 1-1 relationship
  // A new submission request can never result in a merge to an existing algorithm
  // The correct way to update existing algorithm data is to delete the previous algorithm,
  // and fully upload the submission again
  // Once one API key successfully submits, all other keys for the same request is blocked from submitting.

  // Find request based on api key
  const k = await SubmissionKey.findOne({ api_key: apiKey });
  if (!k) throw new Error("API Key not found");
  const request = await Request.findById(k?.request_id);
  // Create algorithm based on request data
  // Upsert algorithm
  const { upsertedId } = await Algorithm.updateOne(
    { requestId: request._id },
    {
      requestId: request._id,
      algo_name: request.algorithmName,
      authors: request.authorName,
      papers: request.paperReference,
      github: request.githubLink,
      comments: request.comments,
      user_id: "",
      best_lower: 0,
      best_solution: 0,
      instances_closed: 0,
    },
    { upsert: true }
  );
  if (!upsertedId) throw new Error("Could not create or update algorithm");
  return await Algorithm.findById(upsertedId);
};

const updateSubmission = async (
  algorithmId: string,
  data: SubmissionItem[]
) => {
  const algoId = new Types.ObjectId(algorithmId);

  const algo = await findAlgorithm(algoId);
  const algoName = algo.algo_name;

  for (const item of data) {
    const instance = await Instance.findById(item.instanceId);
    const scenario = await Scenario.findById(instance.scen_id);

    const submission = await createSubmission(item, scenario.map_id, algoId);

    await processLowerBound(submission, instance, algoName);
    await processSolution(submission, instance, item.solution_plan, algoName);

    if (instance.lower_cost !== null && instance.solution_cost !== null) {
      instance.closed = instance.lower_cost === instance.solution_cost;
    }

    await updateInstance(instance._id, instance);
    await upsertSubmission(submission);
  }
};
const findMap = async (mapName: string) => {
  const map = await Map.findOne({ map_name: mapName });
  if (!map) throw new Error("Error: map not found");
  return map;
};

const processScenarios = async (mapId: Types.ObjectId) => {
  let totalS = 0;
  let totalL = 0;

  for (const i of SCEN_TYPE_IDS) {
    for (const scen_type of SCEN_TYPES) {
      const scen = await findScenario(mapId, i, scen_type);
      const [s, l] = await countInstances(scen._id);

      totalS += s;
      totalL += l;

      await updateScenario(scen._id, s, l);
    }
  }

  return [totalS, totalL];
};

const findScenario = async (
  mapId: Types.ObjectId,
  typeId: string | number,
  scenType: string
) => {
  const scen = await Scenario.findOne({
    map_id: mapId,
    type_id: typeId,
    scen_type: scenType,
  });
  if (!scen) throw new Error("Error: scenario not found");
  return scen;
};

const countInstances = async (scen_id: Types.ObjectId) => {
  const s = await Instance.countDocuments({ scen_id, closed: true });
  const l = await Instance.countDocuments({
    scen_id,
    solution_cost: { $ne: null },
  });

  return [s, l];
};

const updateScenario = async (scenId: Types.ObjectId, s: number, l: number) => {
  await Scenario.updateOne(
    { _id: scenId },
    { $set: { instances_closed: s, instances_solved: l } }
  );
};

const updateMap = async (mapId: Types.ObjectId, s: number, l: number) => {
  await Map.updateOne(
    { _id: mapId },
    { $set: { instances_closed: s, instances_solved: l } }
  );
};

const updateAlgorithm = async (algoId: Types.ObjectId) => {
  const lower = await Submission.countDocuments({
    algo_id: algoId,
    best_lower: true,
  });
  const solution = await Submission.countDocuments({
    algo_id: algoId,
    best_solution: true,
  });
  const closed = await Submission.countDocuments({
    algo_id: algoId,
    $expr: { $eq: ["$lower_cost", "$solution_cost"] },
  });
  const solved = await Submission.countDocuments({
    algo_id: algoId,
    $expr: { $ne: ["$solution_cost", null] },
  });

  await Algorithm.updateOne(
    { _id: algoId },
    {
      $set: {
        best_lower: lower,
        best_solution: solution,
        instances_closed: closed,
        instances_solved: solved,
      },
    }
  );
};

interface SubmissionItem {
  instanceId: string;
  agents: number;
  lower_cost: number;
  solution_cost: number;
  solution_plan: string;
}

interface SubmitDataRequestBody {
  id: string;
  data: SubmissionItem[];
}

const findAlgorithm = async (algoId: Types.ObjectId) => {
  const algo = await Algorithm.findOne({ _id: algoId });
  if (!algo) throw new Error("Error: algorithm not found");
  return algo;
};

const findInstance = async (scenId: Types.ObjectId, agents: number) => {
  const scenario = await Scenario.findById(scenId);
  if (!scenario) throw new Error("Error: scenario not found");
  const instance = await Instance.findOne({
    map_id: scenario.map_id,
    scen_id: scenId,
    agents,
  });
  if (!instance) throw new Error("Error: instance not found");
  return instance;
};

const createSubmission = async (
  item: SubmissionItem,
  mapId: Types.ObjectId,
  algoId: Types.ObjectId
) => {
  const scenId = (await Instance.findById(item.instanceId)).scen_id;
  return {
    map_id: mapId,
    instance_id: new Types.ObjectId(item.instanceId),
    algo_id: algoId,
    lower_cost: item.lower_cost ? item.lower_cost : null,
    solution_cost: item.solution_cost ? item.solution_cost : null,
    best_lower: false,
    best_solution: false,
    date: format(new Date(), "YYYY-MM-DD"),
    agents: item.agents,
    scen_id: scenId,
  } as Infer<typeof Submission>;
};

export const processBest = async (
  field: "lower_cost" | "solution_cost",
  bestField: "best_lower" | "best_solution",
  algoName: string,
  submission: Infer<typeof Submission>,
  instance: Document & Infer<typeof Instance>,
  solutionPlan?: string
) => {
  if (submission[field] !== null) {
    if (instance[field] === null || instance[field] > submission[field]) {
      submission[bestField] = true;
      instance[field] = submission[field];
      instance[`${field}_date`] = submission.date;
      instance.empty = false;
      if (solutionPlan) {
        //FIXME: Side effect
        instance.solution_path_id = await insertSolutionPath(
          instance._id,
          solutionPlan
        );
      }
      instance[`${field}_algos`] = [
        {
          algo_name: algoName,
          algo_id: submission.algo_id,
          date: submission.date,
        },
      ];
      // FIXME: Side effect
      await resetBestFlag(instance._id, bestField);
    } else if (instance[field] === submission[field]) {
      submission[bestField] = true;
      // FIXME: Side effect - modifies instance.`field`_algos
      updateAlgoRecord(
        instance[`${field}_algos`],
        submission.algo_id,
        submission.date,
        algoName
      );
    }
  }
};

function resetBestFlag(
  instanceId: Types.ObjectId,
  bestField: "best_lower" | "best_solution"
) {
  return Submission.updateMany(
    { instance_id: instanceId },
    { $set: { [bestField]: false } }
  );
}

const processLowerBound = async (
  submission: Infer<typeof Submission>,
  instance: Document & Infer<typeof Instance>,
  algoName: string
) => {
  await processBest("lower_cost", "best_lower", algoName, submission, instance);
};

const processSolution = async (
  submission: Infer<typeof Submission>,
  instance: Document & Infer<typeof Instance>,
  algoName: string,
  solutionPath: string
) => {
  await processBest(
    "solution_cost",
    "best_solution",
    algoName,
    submission,
    instance,
    solutionPath
  );
};

const insertSolutionPath = async (
  instanceId: Types.ObjectId,
  solutionPlan: string
): Promise<Types.ObjectId> => {
  const result = await SolutionPath.collection.insertOne({
    instance_id: instanceId,
    solution_path: solutionPlan,
  });
  return result.insertedId;
};

const updateAlgoRecord = (
  algos: Infer<typeof Instance>["lower_algos"],
  algoId: Types.ObjectId,
  date: string,
  algoName: string
) => {
  let recordExist = false;
  let earliestDate = "2222-10-10";

  for (const algo of algos) {
    if (algo.algo_id.equals(algoId)) {
      algo.date = date;
      recordExist = true;
    }
    earliestDate = earliestDate < algo.date ? earliestDate : algo.date;
  }

  if (!recordExist) {
    algos.push({ algo_name: algoName, algo_id: algoId, date });
  }
};

const updateInstance = async (
  instanceId: Types.ObjectId,
  instanceData: Infer<typeof Instance>
) => {
  await Instance.updateOne({ _id: instanceId }, instanceData);
};

const upsertSubmission = async (submission: Infer<typeof Submission>) => {
  await Submission.updateOne(
    {
      map_id: submission.map_id,
      instance_id: submission.instance_id,
      algo_id: submission.algo_id,
    },
    submission,
    { upsert: true }
  );
};

async function retrieveSubmissions(apiKey: string) {
  const cursor = OngoingSubmission.collection.find({ apiKey });
  const items: SubmissionItem[] = [];
  const maps: Set<string> = new Set();
  while (cursor.hasNext()) {
    // load only one document from the resultset into memory
    const doc = (await cursor.next()) as Document &
      Infer<typeof OngoingSubmission>;
    const item = {
      agents: doc.agentCountIntent,
      lower_cost: doc.lowerCost,
      instanceId: (
        await findInstance(doc.scenarioId, doc.agentCountIntent)
      ).id(),
      solution_cost: doc.solutionCost,
      solution_plan: doc.solutionPath,
    };
    items.push(item);
    maps.add(doc.id());
  }
  return { items, maps };
}

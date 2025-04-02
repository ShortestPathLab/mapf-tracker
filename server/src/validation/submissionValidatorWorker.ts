import {
  chain,
  isInteger,
  isNumber,
  join,
  map,
  max,
  min,
  now,
  once,
  sum,
} from "lodash";
import { context } from "logging";
import { Infer, Instance, Map, OngoingSubmission, Scenario } from "models";
import { Document, Types } from "mongoose";
import { customAlphabet } from "nanoid";
import { parseMap, parseScenarioMeta } from "parser";
import { getMap, getScenario } from "resources";
import {
  CheckParams,
  CheckResult,
  Point,
  checkDomainCollision,
  checkDomainOutOfBounds,
  checkEdgeCollision,
  checkGoalReached,
  checkImmediateCollision,
  validate,
} from "validator";
import { connectToDatabase } from "../connection";
import { usingTaskMessageHandler } from "../queue/usingWorker";
import { SubmissionValidatorData } from "./SubmissionValidatorData";

import memoize from "memoizee";
import { memoizeAsync } from "utils/memoizeAsync";
import { asyncMap } from "utils/waitMap";

type OngoingSubmission = Infer<typeof OngoingSubmission> & {
  createdAt?: number;
  updatedAt?: number;
};
const validationResultsKey =
  "validation" as const satisfies keyof OngoingSubmission;

const id = customAlphabet("1234567890");

const log = context(`Validation Worker ${id(6)}`);

type Outcome =
  | "valid"
  | "skipped"
  | "invalid"
  | "error"
  | "outdated"
  | "queued";

type OngoingSubmissionDocument = Document<
  unknown,
  OngoingSubmission,
  OngoingSubmission
> &
  OngoingSubmission;

function createSolutionCostChecker(expected: number = 0) {
  const actual = { value: 0 };
  return [
    (params: CheckParams): CheckResult => {
      if (params.stage !== "final") return {};
      const { paths } = params;
      const cost = sum(paths?.map?.((path) => path.length));
      actual.value = cost;
      if (expected && cost !== expected) {
        return {
          errors: [`agent cost incorrect, expected ${cost}, got ${expected}`],
        };
      }
      return {};
    },
    actual,
  ] as const;
}

const findInstance = memoizeAsync((id: string) => Instance.findById(id));
const findMap = memoizeAsync((id: string) => Map.findById(id));
const findScenario = memoizeAsync((id: string) => Scenario.findById(id));

async function getMeta(instanceId: Types.ObjectId) {
  const instance = await findInstance(instanceId.toString());
  const map = await findMap(instance.map_id.toString());
  const scenario = await findScenario(instance.scen_id.toString());
  const mapContent = await getMap({ map, scenario });
  const scenarioContent = await getScenario({ map, scenario });
  return { map, scenario, mapContent, scenarioContent };
}

async function saveResults(
  submission: OngoingSubmissionDocument,
  errors: { label: string; timesteps?: number[]; agents?: number[] }[],
  meta: { timeTaken: number }
) {
  log.info("Saving results");
  for (const outdated of await OngoingSubmission.find({
    apiKey: submission.apiKey,
    instance: submission.instance,
    updatedAt: { $lt: submission.updatedAt },
  })) {
    await outdated
      .set(validationResultsKey, {
        errors: [],
        isValidationRun: true,
        outcome: "outdated" satisfies Outcome,
      } satisfies OngoingSubmission[typeof validationResultsKey])
      .save();
  }
  await submission
    .set(validationResultsKey, {
      errors,
      isValidationRun: true,
      outcome: (errors.length ? "invalid" : "valid") satisfies Outcome,
      ...meta,
    } satisfies OngoingSubmission[typeof validationResultsKey])
    .save();
}

async function validateGroup({
  cells,
  width,
  height,
  sources,
  goals,
  submission,
  mode,
}: {
  cells: boolean[][];
  width: number;
  height: number;
  sources: Point[];
  goals: Point[];
  submission: OngoingSubmissionDocument;
  mode?: SubmissionValidatorData[number]["mode"];
}) {
  await submission
    .set(validationResultsKey, {
      isValidationRun: false,
      errors: [],
      outcome: "queued" satisfies Outcome,
    } satisfies OngoingSubmission[typeof validationResultsKey])
    .save();

  const count = submission.solutions.length;

  const errors: { label: string; timesteps?: number[]; agents?: number[] }[] =
    [];
  const errorAgents: number[][] = [];

  const [checkSolutionCost, realCost] = createSolutionCostChecker();
  const timeStart = now();
  validate({
    domain: { cells, width, height },
    paths: submission.solutions.map((s) => s || "w"),
    sources: sources.slice(0, count),
    checks: [
      checkImmediateCollision,
      checkDomainOutOfBounds,
      checkDomainCollision,
      checkEdgeCollision,
      checkSolutionCost,
      checkGoalReached,
    ],
    goals: goals.slice(0, count),
    onError: (c) => {
      errors.push({
        label: join(c.errors, "\n"),
        timesteps: c.errorTimesteps ?? [],
        agents: c.errorAgents ?? [],
      });
      return true;
    },
  });

  const timeTaken = now() - timeStart;

  // Update solution cost based on validation results
  // TODO: Refactor for immutability
  await setSolutionCost(submission, realCost.value, errors);

  logOutcome(errors, errorAgents, mode);

  // Don't have to wait to save results
  saveResults(submission, errors, { timeTaken });
  return { errors };
}

async function setSolutionCost(
  submission: OngoingSubmissionDocument,
  realCost: number,
  errors: { label: string }[]
) {
  // There's already an error, don't bother checking solution cost
  if (errors.length) return;
  if (isNumber(submission.cost)) {
    // Check if cost is correct
    if (submission.cost !== realCost) {
      errors.push({
        label: `Cost mismatch, expected ${realCost}, but submission listed its cost as ${submission.cost}`,
      });
      // Don't bother fixing lower bound cost
      return;
    }
  } else {
    // No cost specified, use real cost
    await submission.set("solutionCost", realCost).save();
  }
  // At this point the submission's cost is correct
  const lowerBound = isNumber(submission.lowerBound)
    ? min([submission.lowerBound, realCost])
    : 0;
  // Check if lower bound is correct
  // If incorrect, correct it with real cost
  if (lowerBound !== submission.lowerBound) {
    await submission.set("lowerBound", lowerBound).save();
  }
}

function logOutcome(
  errors: { label: string; timesteps?: number[]; agents?: number[] }[],
  errorAgents: number[][],
  mode?: SubmissionValidatorData[number]["mode"]
) {
  if (errors.length) {
    log.warn("Did not pass validation", map(errors, "label"));
    const a = chain(errorAgents)
      .map((as) => max(as))
      .min()
      .value();
    if (mode === "comprehensive" && isInteger(a) && a > 0)
      log.warn(
        `Errors began on agent ${a}, it's possible that ${
          a - 1
        } agents constitutes a valid solution.`
      );
    return;
  }
  log.info("Passed validation");
}

const connect = once(() => connectToDatabase());

const parseMapMemo = memoize(parseMap);
const parseScenarioMemo = memoize(parseScenarioMeta);

export async function skip(submission: OngoingSubmissionDocument) {
  const errors = [
    { label: "Skipped validation because skip_validation is set" },
  ];
  await submission
    .set(validationResultsKey, {
      isValidationRun: true,
      errors,
      // Set document to valid
      outcome: "valid" satisfies Outcome,
    } satisfies OngoingSubmission[typeof validationResultsKey])
    .save();
  // Set output to skipped
  return { result: { outcome: "skipped" as const satisfies Outcome, errors } };
}

export async function run(data: SubmissionValidatorData[number]): Promise<{
  result: {
    errors?: { label: string }[];
    outcome: Outcome;
  };
}> {
  log.info("Received job");
  await connect();
  try {
    const { submissionId, mode } = data;

    // Can error if submission doesn't exist, this is allowed.
    const submission = (await OngoingSubmission.findById(
      submissionId
    )) as OngoingSubmissionDocument | null;

    if (!submission) throw new Error("Error: submission not found");

    if (submission.options?.skipValidation) return await skip(submission);

    const {
      mapContent: map,
      map: mapMeta,
      scenarioContent: scenario,
      scenario: scenarioMeta,
    } = await getMeta(submission.instance);

    const cells = parseMapMemo(map);
    const { sources, goals, width, height } = parseScenarioMemo(scenario);

    log.info(
      `Validating for ${mapMeta.map_name}-${scenarioMeta.scen_type}-${scenarioMeta.type_id}, agent count ${submission.solutions.length}.`
    );

    const { errors } = await validateGroup({
      sources,
      goals,
      width,
      height,
      cells,
      submission,
      mode,
    });

    return {
      result: { outcome: errors?.length ? "invalid" : "valid", errors },
    };
  } catch (e) {
    log.error("General error", { message: e.message });
    return {
      result: { outcome: "error", errors: [{ label: "General error" }] },
    };
  }
}

export const path = import.meta.path;

if (!Bun.isMainThread) {
  self.onmessage = usingTaskMessageHandler<SubmissionValidatorData, any>((d) =>
    asyncMap(d, run)
  );
}

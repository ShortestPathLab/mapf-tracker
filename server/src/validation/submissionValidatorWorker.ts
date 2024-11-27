import { chain, each, isInteger, max, once, pick } from "lodash";
import { context } from "logging";
import { Infer, Instance, Map, OngoingSubmission, Scenario } from "models";
import { Document, Types } from "mongoose";
import { customAlphabet } from "nanoid";
import { parseMap, parseScenarioMeta } from "parser";
import { getMap, getScenario } from "resources";
import {
  checkDomainCollision,
  checkDomainOutOfBounds,
  checkEdgeCollision,
  checkGoalReached,
  checkImmediateCollision,
  CheckParameters,
  CheckResult,
  FinalCheckParameters,
  Point,
  validate,
} from "validator";
import { connectToDatabase } from "../connection";
import { usingTaskMessageHandler } from "../queue/usingWorker";
import { SubmissionValidatorData } from "./SubmissionValidatorData";
import _memoize, { Options } from "p-memoize";

import memoize from "memoizee";

const memoizeAsync = _memoize as <T extends (...arg0: any[]) => Promise<any>>(
  t: T,
  opts?: Options<T, string>
) => T;

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
  let actual: number = 0;
  return [
    ({ done }: CheckParameters): CheckResult => {
      each(done, (c, i) => {
        actual += +!c[i];
      });
      return {};
    },
    ({}: FinalCheckParameters): CheckResult => {
      if (actual !== expected) {
        return {
          errors: [`agent cost incorrect, expected ${actual}, got ${expected}`],
        };
      }
    },
    actual,
  ] as const;
}

const contentCacheKey = ([{ map, scenario }]: [
  { map: Infer<typeof Map>; scenario: Infer<typeof Scenario> }
]): string => `${map}::${scenario}`;

const findInstance = memoizeAsync((id: string) => Instance.findById(id));
const findMap = memoizeAsync((id: string) => Map.findById(id));
const findScenario = memoizeAsync((id: string) => Scenario.findById(id));

const getMapMemo = memoizeAsync(getMap, { cacheKey: contentCacheKey });
const getScenarioMemo = memoizeAsync(getScenario, {
  cacheKey: contentCacheKey,
});

async function getMeta(instanceId: Types.ObjectId) {
  const instance = await findInstance(instanceId.toString());
  const map = await findMap(instance.map_id.toString());
  const scenario = await findScenario(instance.scen_id.toString());
  const mapContent = await getMapMemo({ map, scenario });
  const scenarioContent = await getScenarioMemo({ map, scenario });
  return { map, scenario, mapContent, scenarioContent };
}

async function saveResults(
  submission: OngoingSubmissionDocument,
  errors: string[]
) {
  log.info("Saving results");
  for (const outdated of await OngoingSubmission.find({
    apiKey: submission.apiKey,
    instance: submission.instance,
    createdAt: { $lt: submission.createdAt },
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
    } satisfies OngoingSubmission[typeof validationResultsKey])
    .save();
  log.info("Results saved");
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
  mode?: SubmissionValidatorData["mode"];
}) {
  await submission
    .set(validationResultsKey, {
      isValidationRun: false,
      errors: [],
      outcome: "queued" satisfies Outcome,
    } satisfies OngoingSubmission[typeof validationResultsKey])
    .save();

  const count = submission.solutions.length;

  const errors: string[] = [];
  const errorAgents: number[][] = [];

  const [updateSolutionCost, , realCost] = createSolutionCostChecker();

  validate({
    domain: { cells, width, height },
    paths: submission.solutions.map((s) => s || "w"),
    sources: sources.slice(0, count),
    onTimestep: [
      checkImmediateCollision,
      checkDomainOutOfBounds,
      checkDomainCollision,
      checkEdgeCollision,
      updateSolutionCost,
    ],
    onFinish: [checkGoalReached],
    goals: goals.slice(0, count),
    onError: (c) => {
      errors.push(...c.errors);
      errorAgents.push(c.errorAgents);
      return true;
    },
  });

  // Update solution cost based on validation results
  // TODO: Refactor for immutability
  submission.set("solutionCost", realCost);

  logOutcome(errors, errorAgents, mode);

  // Don't have to wait to save results
  saveResults(submission, errors);
  return { errors };
}

function logOutcome(
  errors: string[],
  errorAgents: number[][],
  mode?: SubmissionValidatorData["mode"]
) {
  if (errors.length) {
    log.warn("Did not pass validation", errors);
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

export async function run(data: SubmissionValidatorData): Promise<{
  result: {
    errors?: string[];
    outcome: Outcome;
  };
}> {
  log.info("Received job");
  await connect();
  try {
    const { submissionId, mode } = data;

    const submission = await OngoingSubmission.findById(submissionId);

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
    log.error("General error", e);
    return { result: { outcome: "error", errors: ["General error"] } };
  }
}

export const path = import.meta.path;

if (!Bun.isMainThread) {
  self.onmessage = usingTaskMessageHandler<SubmissionValidatorData, any>(run);
}

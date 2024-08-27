import {
  chain,
  each,
  every,
  filter,
  isInteger,
  max,
  maxBy,
  pick,
  range,
  values,
  zip,
} from "lodash";
import { context } from "logging";
import { Infer, OngoingSubmission } from "models";
import { Document } from "mongoose";
import { customAlphabet } from "nanoid";
import { parseMap, parseScenarioMeta } from "parser";
import {
  checkDomainCollision,
  checkDomainOutOfBounds,
  checkEdgeCollision,
  checkGoalReached,
  checkImmediateCollision,
  CheckResult,
  FinalCheckParameters,
  Point,
  validate,
} from "validator";
import { connectToDatabase } from "../connection";
import { SubmissionValidatorData } from "./SubmissionValidatorData";
import { usingMessageHandler } from "./usingWorker";
import { CheckParameters } from "validator";

type OngoingSubmission = Infer<typeof OngoingSubmission> & {
  createdAt?: number;
  updatedAt?: number;
};
const validationResultsKey =
  "validation" as const satisfies keyof OngoingSubmission;

const id = customAlphabet("1234567890");

const log = context(`Validation Worker ${id(6)}`);

type Outcome = "valid" | "skipped" | "invalid" | "error" | "outdated";

type OngoingSubmissionDocument = Document<
  unknown,
  OngoingSubmission,
  OngoingSubmission
> &
  OngoingSubmission;

function createSolutionCostChecker(expected: number[]) {
  const costs: number[] = [];
  return [
    ({ done }: CheckParameters): CheckResult => {
      each(done, (c, i) => {
        costs[i] += +!c[i];
      });
      return {};
    },
    ({}: FinalCheckParameters): CheckResult => {
      const error = zip(expected, costs)
        .map(([a, b], i) => [a, b, i])
        .find(([a, b]) => a !== b);
      if (error) {
        const [a, b, i] = error;
        return {
          errors: [`agent cost incorrect, expected ${a}, got ${b}`],
          errorAgents: [i],
        };
      }
    },
  ] as const;
}

async function saveResults(
  submission: OngoingSubmissionDocument[],
  outdated: OngoingSubmissionDocument[],
  errors: string[]
) {
  log.info("Saving results");
  for (const s of submission) {
    s.set(validationResultsKey, {
      errors,
      isValidationRun: true,
      outcome: (errors.length ? "invalid" : "valid") satisfies Outcome,
    } satisfies OngoingSubmission[typeof validationResultsKey]);
    await s.save();
  }
  for (const s of outdated) {
    s.set(validationResultsKey, {
      errors: [],
      isValidationRun: true,
      outcome: "outdated" satisfies Outcome,
    } satisfies OngoingSubmission[typeof validationResultsKey]);
    await s.save();
  }
  log.info("Results saved");
}

async function validateGroup({
  cells,
  width,
  height,
  sources,
  goals,
  submission,
  agentCount,
  mode,
}: {
  cells: boolean[][];
  width: number;
  height: number;
  sources: Point[];
  goals: Point[];
  agentCount: number;
  submission: OngoingSubmissionDocument[];
  mode?: SubmissionValidatorData["mode"];
}) {
  log.info(`Validating for agent count ${agentCount}`);
  const cache = chain(submission)
    .groupBy("index")
    .mapValues((c) => maxBy(c, (c) => c.createdAt))
    .value();
  const group = values(cache);

  const b = chain(cache)
    .map("index")
    .max()
    .thru((c) => c + 1)
    .value();

  const costs = range(0, b).map((_, i) => cache[i]?.solutionCost ?? 0);

  const errors: string[] = [];
  const errorAgents: number[][] = [];

  const [updateSolutionCost, checkSolutionCost] =
    createSolutionCostChecker(costs);

  validate({
    domain: { cells, width, height },
    paths: range(b).map((i) => cache[`${i}`]?.solutionPath ?? "w"),
    sources: sources.slice(0, b),
    onTimestep: [
      checkImmediateCollision,
      checkDomainOutOfBounds,
      checkDomainCollision,
      checkEdgeCollision,
      updateSolutionCost,
    ],
    onFinish: [checkGoalReached, checkSolutionCost],
    goals: goals.slice(0, b),
    onError: (c) => {
      errors.push(...c.errors);
      errorAgents.push(c.errorAgents);
      return true;
    },
  });

  logOutcome(errors, errorAgents, mode);

  await saveResults(
    group,
    filter(submission, (c) => !group.includes(c)),
    errors
  );
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

export async function run(data: SubmissionValidatorData): Promise<{
  result: {
    errors?: string[];
    outcome: Outcome;
  };
}> {
  log.info(
    "Received job",
    pick(data, "apiKey", "mapId", "scenarioId", "agentCountIntent")
  );
  await connectToDatabase();
  try {
    const { apiKey, mapId, scenarioId, map, scenario, agentCountIntent, mode } =
      data;

    const submission = await OngoingSubmission.find({
      apiKey,
      mapId,
      scenarioId,
      agentCountIntent,
    });

    if (every(submission, (c) => c.validation?.isValidationRun)) {
      log.info("Validation already run on submission set");
      return { result: { outcome: "skipped" } };
    }

    const cells = parseMap(map);
    const { sources, goals, width, height } = parseScenarioMeta(scenario);

    const { errors } = await validateGroup({
      agentCount: agentCountIntent,
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
  self.onmessage = usingMessageHandler<SubmissionValidatorData, any>(
    ({ data }) => run(data)
  );
}

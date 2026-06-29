import { chain, has, isInteger, isNumber, join, map, max, min, now, once, split } from "lodash";
import { context } from "logging";
import { Infer, OngoingSubmission, OngoingSubmissionSolution } from "models";
import { Document, Types } from "mongoose";
import { customAlphabet } from "nanoid";
import { parseMap, parseScenarioMeta } from "parser";
import { getMap, getScenario } from "resources";
import { Point, validate } from "validator-wasm";
import { connectToDatabase } from "../connection";
import { usingTaskMessageHandler } from "../queue/usingWorker";
import { SubmissionValidatorData } from "./SubmissionValidatorData";

import memoize from "memoizee";
import { asyncMap } from "utils/waitMap";
import { findInstance, findMapMemo, findScenarioMemo } from "utils/findMemo";
import { required } from "utils/assert";

type OngoingSubmission = Infer<typeof OngoingSubmission> & {
  createdAt?: number;
  updatedAt?: number;
};
const validationResultsKey = "validation" as const satisfies keyof OngoingSubmission;

const id = customAlphabet("1234567890");

const log = context(`Validation Worker ${id(6)}`);

type Outcome = "valid" | "skipped" | "invalid" | "error" | "outdated" | "queued";

type OngoingSubmissionDocument = Document<unknown, OngoingSubmission, OngoingSubmission> &
  OngoingSubmission;

type BulkOp = Parameters<typeof OngoingSubmission.bulkWrite>[0][number];

async function getMeta(instanceId: Types.ObjectId) {
  const instance = required(await findInstance(instanceId));
  const map = required(await findMapMemo(instance.map_id));
  const scenario = required(await findScenarioMemo(instance.scen_id));
  const mapContent = await getMap({ map, scenario });
  const scenarioContent = await getScenario({ map, scenario });
  return { map, scenario, mapContent, scenarioContent };
}

async function buildResultWrites(
  submission: OngoingSubmissionDocument,
  errors: { label: string; timesteps?: number[]; agents?: number[] }[],
  meta: { timeTaken: number },
  extra: { cost?: number; lowerBound?: number } = {},
): Promise<BulkOp[]> {
  log.info("Building result writes");
  const ops: BulkOp[] = [];
  for (const outdated of await OngoingSubmission.find({
    apiKey: submission.apiKey,
    instance: submission.instance,
    updatedAt: { $lt: submission.updatedAt },
  }).select("_id")) {
    ops.push({
      updateOne: {
        filter: { _id: outdated._id },
        update: {
          $set: {
            [validationResultsKey]: {
              errors: [],
              isValidationRun: true,
              outcome: "outdated" satisfies Outcome,
            } satisfies OngoingSubmission[typeof validationResultsKey],
          },
        },
      },
    });
  }
  ops.push({
    updateOne: {
      filter: { _id: submission._id },
      update: {
        $set: {
          ...extra,
          [validationResultsKey]: {
            errors,
            isValidationRun: true,
            outcome: (errors.length ? "invalid" : "valid") satisfies Outcome,
            ...meta,
          } satisfies OngoingSubmission[typeof validationResultsKey],
        },
      },
    },
  });
  return ops;
}

async function validateGroup({
  cells,
  width,
  height,
  sources,
  goals,
  submission,
  mode,
  solutions = [],
}: {
  cells: boolean[][];
  width: number;
  height: number;
  sources: Point[];
  goals: Point[];
  submission: OngoingSubmissionDocument;
  solutions?: string[];
  mode?: SubmissionValidatorData[number]["mode"];
}): Promise<{ errors: { label: string }[]; writes: BulkOp[] }> {
  const count = solutions.length;

  const errors: { label: string; timesteps?: number[]; agents?: number[] }[] = [];
  const errorAgents: number[][] = [];

  const timeStart = now();
  const { errors: checkErrors, cost: realCost } = validate({
    domain: { cells, width, height },
    paths: solutions.map((s) => s ?? ""),
    sources: sources.slice(0, count),
    checks: [
      "immediateCollision",
      "domainOutOfBounds",
      "domainCollision",
      "edgeCollision",
      "goalReached",
    ],
    goals: goals.slice(0, count),
    // stopOnFirstError defaults to true, matching the previous onError === true
  });
  for (const c of checkErrors) {
    errors.push({
      label: join(c.errors, "\n"),
      timesteps: c.errorTimesteps ?? [],
      agents: c.errorAgents ?? [],
    });
  }

  const timeTaken = now() - timeStart;

  // Update solution cost based on validation results
  const costUpdate = computeSolutionCost(submission, realCost, errors);

  logOutcome(errors, errorAgents, mode);

  const writes = await buildResultWrites(submission, errors, { timeTaken }, costUpdate);
  return { errors, writes };
}

function computeSolutionCost(
  submission: OngoingSubmissionDocument,
  realCost: number,
  errors: { label: string }[],
): { cost?: number; lowerBound?: number } {
  const update: { cost?: number; lowerBound?: number } = {};
  // There's already an error, don't bother checking solution cost
  if (errors.length) return update;
  if (isNumber(submission.cost)) {
    // Check if cost is correct
    if (submission.cost !== realCost) {
      errors.push({
        label: `Cost mismatch, expected ${realCost}, but submission listed its cost as ${submission.cost}`,
      });
      // Don't bother fixing lower bound cost
      return update;
    }
  } else {
    // No cost specified, use real cost
    update.cost = realCost;
  }
  // At this point the submission's cost is correct
  const lowerBound = isNumber(submission.lowerBound) ? min([submission.lowerBound, realCost]) : 0;
  // Check if lower bound is correct
  // If incorrect, correct it with real cost
  if (lowerBound !== submission.lowerBound) {
    update.lowerBound = lowerBound;
  }
  return update;
}

function logOutcome(
  errors: { label: string; timesteps?: number[]; agents?: number[] }[],
  errorAgents: number[][],
  mode?: SubmissionValidatorData[number]["mode"],
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
        } agents constitutes a valid solution.`,
      );
    return;
  }
  log.info("Passed validation");
}

const connect = once(() => connectToDatabase());

const parseMapMemo = memoize(parseMap);
const parseScenarioMemo = memoize(parseScenarioMeta);

export function skip(submission: OngoingSubmissionDocument) {
  const errors = [{ label: "Skipped validation because skip_validation is set" }];
  const writes: BulkOp[] = [
    {
      updateOne: {
        filter: { _id: submission._id },
        update: {
          $set: {
            [validationResultsKey]: {
              isValidationRun: true,
              errors,
              // Set document to valid
              outcome: "valid" satisfies Outcome,
            } satisfies OngoingSubmission[typeof validationResultsKey],
          },
        },
      },
    },
  ];
  // Set output to skipped
  return {
    result: { outcome: "skipped" as const satisfies Outcome, errors },
    writes,
  };
}

export async function run(data: SubmissionValidatorData[number]): Promise<{
  result: {
    errors?: { label: string }[];
    outcome: Outcome;
  };
  writes: BulkOp[];
}> {
  log.info("Received job");
  try {
    await connect();
    const { submissionId, mode } = data;

    // Can error if submission doesn't exist, this is allowed.
    const submission = (await OngoingSubmission.findById(
      submissionId,
    )) as OngoingSubmissionDocument | null;

    if (!submission) throw new Error("Error: submission not found");

    if (submission.options?.skipValidation) return skip(submission);

    const {
      mapContent: map,
      map: mapMeta,
      scenarioContent: scenario,
      scenario: scenarioMeta,
    } = await getMeta(submission.instance);

    const cells = parseMapMemo(map);
    const { sources, goals, width, height } = parseScenarioMemo(scenario);

    const { solutions } = (await OngoingSubmissionSolution.findById(submission._id)) ?? {};

    log.info(
      `Validating for ${mapMeta.map_name}-${scenarioMeta.scen_type}-${
        scenarioMeta.type_id
      }, agent count ${solutions?.length ?? 0}.`,
    );

    const { errors, writes } = await validateGroup({
      sources,
      goals,
      solutions: split(solutions, "\n"),
      width,
      height,
      cells,
      submission,
      mode,
    });

    return {
      result: { outcome: errors?.length ? "invalid" : "valid", errors },
      writes,
    };
  } catch (e) {
    log.error("General error", { message: has(e, "message") ? e.message : e });
    return {
      result: { outcome: "error", errors: [{ label: "General error" }] },
      writes: [],
    };
  }
}

export const path = import.meta.path;

if (!Bun.isMainThread) {
  self.onmessage = usingTaskMessageHandler<SubmissionValidatorData, any>(async (d) => {
    const outcomes = await asyncMap(d, run);
    const writes = outcomes.flatMap((o) => o.writes);
    if (writes.length) {
      log.info(`Executing ${writes.length} write(s) via bulkWrite`);
      await OngoingSubmission.bulkWrite(writes);
    }
    return outcomes.map((o) => o.result);
  });
}

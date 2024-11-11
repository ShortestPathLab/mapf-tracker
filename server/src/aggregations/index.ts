import { stage as reset } from "./stages/reset";
import { stage as updateAlgorithmsFromSubmissions } from "./stages/updateAlgorithmsFromSubmissions";
import { stage as updateMapsFromScenarios } from "./stages/updateMapsFromScenarios";
import { stage as updateScenariosFromInstances } from "./stages/updateScenariosFromInstances";
import { stage as updateInstancesFromSubmissions } from "./stages/updateInstancesFromSubmissions";
import { stage as updateSolutionPathsFromSubmissions } from "./stages/updateSolutionPathsFromSubmissions";
import { stage as updateSubmissionsWithOngoingSubmissions } from "./stages/updateSubmissionsWithOngoingSubmissions";
import { stage as updateInstancesSubmissionHistory } from "./stages/updateInstancesSubmissionHistory";
import { stage as pruneOngoingSubmissions } from "./stages/pruneOngoingSubmissions";
import {
  mockStageA,
  mockStageB,
  mockStageCExpectError,
} from "./stages/mockStages";

export const stages = {
  reset,
  updateMapsFromScenarios,
  updateScenariosFromInstances,
  updateInstancesFromSubmissions,
  updateSolutionPathsFromSubmissions,
  updateAlgorithmsFromSubmissions,
  updateSubmissionsWithOngoingSubmissions,
  updateInstancesSubmissionHistory,
  pruneOngoingSubmissions,
  mockStageA,
  mockStageB,
  mockStageCExpectError,
};

export * from "./pipeline";

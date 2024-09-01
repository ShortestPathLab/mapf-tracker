import { stage as updateAlgorithmsFromSubmissions } from "./stages/updateAlgorithmsFromSubmissions";
import { stage as updateMapsFromScenarios } from "./stages/updateMapsFromScenarios";
import { stage as updateScenariosFromInstances } from "./stages/updateScenariosFromInstances";
import { stage as updateInstancesFromSubmissions } from "./stages/updateInstancesFromSubmissions";
import { stage as updateSolutionPathsFromSubmissions } from "./stages/updateSolutionPathsFromSubmissions";
import { stage as updateSubmissionsWithOngoingSubmissions } from "./stages/updateSubmissionsWithOngoingSubmissions";
import {
  mockStageA,
  mockStageB,
  mockStageCExpectError,
} from "./stages/mockStages";

export const stages = {
  updateAlgorithmsFromSubmissions,
  updateMapsFromScenarios,
  updateScenariosFromInstances,
  updateInstancesFromSubmissions,
  updateSolutionPathsFromSubmissions,
  updateSubmissionsWithOngoingSubmissions,
  mockStageA,
  mockStageB,
  mockStageCExpectError,
};

export * from "./pipeline";

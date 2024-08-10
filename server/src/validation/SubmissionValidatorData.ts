export type SubmissionValidatorData = {
  mapId: string;
  map: string;
  scenario: string;
  apiKey: string;
  scenarioId: string;
  mode?: "abort-early" | "comprehensive";
  agentCountIntent?: number;
};

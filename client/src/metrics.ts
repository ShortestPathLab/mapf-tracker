export type BaseMetric = { key: string; name: string };

export const metrics = [
  { key: "closed", name: "Instances closed" },
  { key: "solved", name: "Instances solved" },
  { key: "lower", name: "Best lower-bound" },
  { key: "solution", name: "Best solution" },
] satisfies BaseMetric[];

export const scenarioMetrics = [
  { key: "solutionCost", name: "Solution cost" },
  { key: "lower", name: "Lower-bound" },
] satisfies BaseMetric[];

export type Metric = (typeof metrics)[number]["key"];

export type ScenarioMetric = (typeof metrics)[number]["key"];

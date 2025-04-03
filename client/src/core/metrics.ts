export type BaseMetric = { key: string; name: string; keyAlt?: string };

export const metrics = [
  { key: "solved", keyAlt: "solved", name: "Instances solved" },
  { key: "solution", keyAlt: "best_solution", name: "Best solution" },
  { key: "closed", keyAlt: "closed", name: "Instances closed" },
  { key: "lower", keyAlt: "best_lower", name: "Best lower-bound" },
] as const satisfies BaseMetric[];

export const scenarioMetrics = [
  { key: "solutionCost", name: "Solution cost" },
  { key: "lower", name: "Lower-bound" },
] as const satisfies BaseMetric[];

export type Metric = (typeof metrics)[number]["key"];

export type ScenarioMetric = (typeof metrics)[number]["key"];

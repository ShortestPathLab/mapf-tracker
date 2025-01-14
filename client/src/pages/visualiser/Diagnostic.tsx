export type Diagnostic = {
  /**
   * When t is undefined, the error applies for the entire timespan.
   */
  t?: number;
  x?: number;
  y?: number;
  agents: number[];
  label: string;
};

import { SummaryResult } from "core/types";

export type Models = {
  map: SummaryResult["maps"][0];
  scenario: SummaryResult["maps"][0]["scenarios"][0];
  instance: { id: string; scenario: string; index: number };
  fallback: { id: string };
};
export type Model = Models[keyof Models];
export function disambiguate<R>(
  m: Model,
  options: {
    [K in keyof Models]?: (m: Models[K]) => R;
  }
) {
  if ("scenarios" in m) return options?.map?.(m);
  if ("count" in m) return options?.scenario?.(m);
  if ("scenario" in m) return options?.instance?.(m);
  return options?.fallback?.(m);
}

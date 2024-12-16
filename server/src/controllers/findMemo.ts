import { Instance, Map, Scenario } from "models";
import _memoize from "p-memoize";

const memoize = _memoize as <T>(t: T) => T;
export const findInstance = memoize((id: string) => Instance.findById(id));
export const findMap = memoize((id: string) => Map.findById(id));
export const findScenario = memoize((id: string) => Scenario.findById(id));

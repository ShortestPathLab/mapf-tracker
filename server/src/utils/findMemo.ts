import { Instance, Map, Scenario } from "models";
import { Types } from "mongoose";
import _memoize from "p-memoize";

const memo = <T, U>(f: (t: T) => Promise<U>) =>
  _memoize(f, { cacheKey: ([a]) => a?.toString?.() }) as <T>(
    t: T
  ) => Promise<U>;

export const findInstance = (id: string | Types.ObjectId) =>
  Instance.findById(id?.toString?.());
export const findInstanceMemo = memo(findInstance);

export const findMap = (id: string | Types.ObjectId) =>
  Map.findById(id.toString());
export const findMapMemo = memo(findMap);

export const findScenario = (id: string | Types.ObjectId) =>
  Scenario.findById(id?.toString?.());
export const findScenarioMemo = memo(findScenario);

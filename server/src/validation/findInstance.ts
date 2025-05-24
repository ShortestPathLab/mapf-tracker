import { keyBy } from "lodash";
import { model as Instance } from "models/Instance";
import { memoizeAsync } from "utils/memoizeAsync";

const findInstancesMemo = memoizeAsync(
  async ({ scen_id }: { scen_id: string }) => {
    const instances = await Instance.find({ scen_id }, { _id: 1, agents: 1 });
    return keyBy(instances, "agents");
  },
  {
    cacheKey: JSON.stringify,
  }
);
export const findInstanceByAgentScenario = async ({
  scen_id,
  agents,
}: {
  scen_id: string;
  agents: number;
}) => {
  const index = await findInstancesMemo({ scen_id });
  return index[`${agents}`];
};

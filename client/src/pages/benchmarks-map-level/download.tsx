import { Scenario } from "core/types";
import download from "downloadjs";
import { json2csv } from "json-2-csv";
import api, { unwrap } from "hooks/useQuery";

export const downloadScenario = (map: string) => async (item?: Scenario) => {
  if (item)
    return download(
      await fetch(`./assets/scens/${map}-${item.scen_type}-${item.type_id}.scen`).then((r) =>
        r.text(),
      ),
      `${map}.scen`,
    );
};

export const downloadInstance = (map: string) => async (item?: Scenario) => {
  if (item) {
    return download(
      json2csv(await unwrap(api.api.instance.download.scenario({ id: item.id }).get())),
      `${map}-${item.scen_type}-${item.type_id}.csv`,
    );
  }
};

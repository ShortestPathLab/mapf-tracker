import { APIConfig } from "core/config";
import { InstanceCollection } from "core/types";
import download from "downloadjs";
import { json2csv } from "json-2-csv";
import { json, text } from "queries/query";

export const downloadScenario =
  (map: string) => async (item?: InstanceCollection) => {
    if (item)
      return download(
        await text(
          `./assets/scens/${map}-${item.scen_type}-${item.type_id}.scen`
        ),
        `${map}.scen`
      );
  };

export const downloadInstance =
  (map: string) => async (item?: InstanceCollection) => {
    if (item) {
      return download(
        json2csv(
          await json(`${APIConfig.apiUrl}/instance/DownloadInstance/${item.id}`)
        ),
        `${map}-${item.scen_type}-${item.type_id}.csv`
      );
    }
  };

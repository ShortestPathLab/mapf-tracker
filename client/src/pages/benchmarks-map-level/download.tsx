import { APIConfig } from "config";
import download from "downloadjs";
import { json2csv } from "json-2-csv";
import { text } from "queries/query";
import { Benchmark, ScenarioCollection } from "types";

export const downloadScenario =
  (map: string) => async (item?: ScenarioCollection) => {
    if (item)
      return download(
        await text(
          `./assets/scens/${map}-${item.scen_type}-${item.type_id}.scen`
        ),
        `${map}.scen`
      );
  };
export const downloadMap = (map: string) => async () =>
  download(await text(`./assets/maps/${map}.map`), `${map}.map`);

export const downloadInstance = (map: string) => async (item?: Benchmark) => {
  if (item) {
    return download(
      json2csv(
        await fetch(
          `${APIConfig.apiUrl}/instance/DownloadInstance/${item.id}`
        ).then((r) => r.json())
      ),
      `${map}-${item.scen_type}-${item.type_id}.csv`
    );
  }
};

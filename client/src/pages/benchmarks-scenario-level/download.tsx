import { APIConfig } from "config";
import download from "downloadjs";
import { json2csv } from "json-2-csv";
import { json, text } from "queries/query";
import { Benchmark, Scenario, ScenarioCollection } from "types";

export const downloadRow = async (item?: Scenario) => {
  if (item)
    return download(
      json2csv(
        await json(`${APIConfig.apiUrl}/instance/DownloadRow/${item.id}`)
      ),
      `${item.id}.csv`
    );
};

import { APIConfig } from "core/config";
import download from "downloadjs";
import { json2csv } from "json-2-csv";
import { json, text } from "queries/query";
import { Benchmark, Instance, InstanceCollection } from "core/types";

export const downloadRow = async (item?: Instance) => {
  if (item)
    return download(
      json2csv(
        await json(`${APIConfig.apiUrl}/instance/DownloadRow/${item.id}`)
      ),
      `${item.id}.csv`
    );
};

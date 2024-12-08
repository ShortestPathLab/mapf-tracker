import { APIConfig } from "core/config";
import { Instance } from "core/types";
import download from "downloadjs";
import { json2csv } from "json-2-csv";
import { json } from "queries/query";

export const downloadRow = async (item?: Instance) => {
  if (item)
    return download(
      json2csv(
        await json(`${APIConfig.apiUrl}/instance/DownloadRow/${item.id}`)
      ),
      `${item.id}.csv`
    );
};

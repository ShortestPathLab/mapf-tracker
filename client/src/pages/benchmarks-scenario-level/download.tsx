import { Instance } from "core/types";
import download from "downloadjs";
import { json2csv } from "json-2-csv";
import api, { unwrap } from "hooks/useQuery";

export const downloadRow = async (item?: Instance) => {
  if (item)
    return download(
      json2csv(await unwrap(api.api.instance.DownloadRow({ id: item.id }).get())),
      `${item.id}.csv`
    );
};

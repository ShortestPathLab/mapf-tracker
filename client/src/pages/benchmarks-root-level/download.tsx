import { Map } from "core/types";
import download from "downloadjs";
import { json2csv } from "json-2-csv";
import api, { unwrap } from "hooks/useQuery";

export async function downloadBenchmarks(item?: Map) {
  if (item)
    return download(
      await fetch(`./assets/download/${item.map_name}.zip`).then((r) => r.blob()),
      `${item.map_name}.zip`,
    );
}
export async function downloadMap(item?: Map) {
  if (item)
    return download(
      await fetch(`./assets/maps/${item.map_name}.map`).then((r) => r.text()),
      `${item.map_name}.map`,
    );
}

export async function downloadBenchmarksResultsCSV(item?: Map) {
  if (item) {
    return download(
      json2csv(await unwrap(api.api.instance.download.map({ id: item.id }).get())),
      `${item.map_name}.csv`,
    );
  }
}

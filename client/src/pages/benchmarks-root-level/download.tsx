import { APIConfig } from "core/config";
import { Map } from "core/types";
import download from "downloadjs";
import { json2csv } from "json-2-csv";
import { blob, json, text } from "queries/query";

export async function downloadBenchmarks(item?: Map) {
  if (item)
    return download(
      await blob(`./assets/download/${item.map_name}.zip`),
      `${item.map_name}.zip`
    );
}
export async function downloadMap(item?: Map) {
  if (item)
    return download(
      await text(`./assets/maps/${item.map_name}.map`),
      `${item.map_name}.map`
    );
}

export async function downloadBenchmarksResultsCSV(item?: Map) {
  if (item) {
    return download(
      json2csv(
        await json(`${APIConfig.apiUrl}/instance/DownloadMapByID/${item.id}`)
      ),
      `${item.map_name}.csv`
    );
  }
}

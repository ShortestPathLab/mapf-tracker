import { APIConfig } from "core/config";
import { Benchmark } from "core/types";
import download from "downloadjs";
import { json2csv } from "json-2-csv";
import { blob, json, text } from "queries/query";

export async function downloadBenchmarks(item?: Benchmark) {
  if (item)
    return download(
      await blob(`./assets/download/${item.map_name}.zip`),
      `${item.map_name}.zip`
    );
}
export async function downloadMap(item?: Benchmark) {
  if (item)
    return download(
      await text(`./assets/map/${item.map_name}.map`),
      `${item.map_name}.map`
    );
}

export async function downloadBenchmarksResultsCSV(item?: Benchmark) {
  if (item) {
    return download(
      json2csv(
        await json(`${APIConfig.apiUrl}/instance/DownloadMapByID/${item.id}`)
      ),
      `${item.map_name}.csv`
    );
  }
}

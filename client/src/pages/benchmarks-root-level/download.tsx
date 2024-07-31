import { APIConfig } from "config";
import download from "downloadjs";
import { json2csv } from "json-2-csv";
import { Benchmark } from "types";

export async function downloadBenchmarks(item?: Benchmark) {
  if (item)
    return download(
      await fetch(`./assets/download/${item.map_name}.zip`).then((r) =>
        r.blob()
      ),
      `${item.map_name}.zip`
    );
}

export async function downloadBenchmarksResultsCSV(item?: Benchmark) {
  if (item) {
    return download(
      json2csv(
        await fetch(
          `${APIConfig.apiUrl}/instance/DownloadMapByID/${item.id}`
        ).then((r) => r.json())
      ),
      `${item.map_name}.csv`
    );
  }
}

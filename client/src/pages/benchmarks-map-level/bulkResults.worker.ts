import { json2csv } from "json-2-csv";
import { resultQuery } from "./resultQuery";

self.window = self;

self.onmessage = async ({
  data,
}: MessageEvent<{
  name: string;
  limit: number;
  includeSolutions: boolean;
}>) => {
  const { name, limit, includeSolutions } = data;
  let count = 0;
  await resultQuery(
    name,
    limit,
    includeSolutions,
    ({ progress = 0, status }) => {
      self.postMessage({
        type: "progress",
        payload: { progress: 0.25 + progress / 2, status },
      });
    },
    (node) => {
      const csv = json2csv([node as object], {
        emptyFieldValue: "",
        prependHeader: count === 0,
      });
      const encoder = new TextEncoder();
      const encoded = encoder.encode(`${csv}\n`);
      self.postMessage(
        {
          type: "data",
          payload: encoded,
        },
        null,
        [encoded]
      );
      count++;
    }
  );
  self.postMessage({ type: "done" });
};

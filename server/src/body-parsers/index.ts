import { NextFunction, Request, Response } from "express";
import { parseCsvAsync } from "./parseCsv.worker";
import { parseYamlAsync } from "./parseYaml.worker";

const createParser = <T extends (input: string) => Promise<unknown>>(
  name: string,
  predicate: (req: Request) => boolean,
  callback: T,
  encoding: BufferEncoding = "utf8"
): ((req: Request, res: Response, next: NextFunction) => void) => {
  return (req, res, next) => {
    if (predicate(req)) {
      let data = "";
      req.setEncoding(encoding);
      req.on("data", (chunk) => {
        data += chunk;
      });
      req.on("end", async () => {
        try {
          req.body = await callback(data);
          next();
        } catch (e) {
          res.status(400).send(`Invalid ${name} format`);
        }
      });
      return;
    }
    next();
  };
};

export const yamlParser = createParser(
  "yaml",
  (req) => !!(req.is("application/yaml") || req.is("application/json")),
  parseYamlAsync
);

export const csvParser = createParser(
  "csv",
  (req) => !!req.is("text/csv"),
  parseCsvAsync
);

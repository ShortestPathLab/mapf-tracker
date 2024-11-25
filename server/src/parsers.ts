import { NextFunction, Request, Response } from "express";
import { loadAll } from "js-yaml";
import { head, mapValues } from "lodash";
import csv from "neat-csv";

export const yamlParser = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (req.is("application/yaml")) {
    let data = "";
    req.setEncoding("utf8");
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", () => {
      try {
        const a = loadAll(data);
        req.body = a.length > 1 ? a : head(a);
        next();
      } catch (e) {
        res.status(400).send("Invalid YAML format");
      }
    });
    return;
  }
  next();
};

export const csvParser = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (req.is("text/csv")) {
    let data = "";
    req.setEncoding("utf8");
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", async () => {
      try {
        req.body = (await csv(data)).map((x) =>
          mapValues(x, (v: any) =>
            // Coerce boolean
            v === "TRUE"
              ? true
              : v === "FALSE"
              ? false
              : // Coerce number
              isNaN(+v)
              ? v
              : +v
          )
        );
        next();
      } catch (e) {
        res.status(400).send("Invalid CSV format");
      }
    });
    return;
  }
  next();
};

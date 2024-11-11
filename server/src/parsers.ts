import csvToJson from "convert-csv-to-json";
import { load } from "js-yaml";
import { Request, Response, NextFunction } from "express";

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
        req.body = load(data);
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
    req.on("end", () => {
      try {
        req.body = csvToJson.getJsonFromCsv(data);
        next();
      } catch (e) {
        res.status(400).send("CSV");
      }
    });
    return;
  }
  next();
};

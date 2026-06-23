import { password } from "bun";
import { Elysia } from "elysia";
import { Model, Types } from "mongoose";
import passport from "passport";
import { authenticate, configurePassport, use as useAuth } from "auth";
import { parseCsvAsync } from "./body-parsers/parseCsv.worker";
import { parseYamlAsync } from "./body-parsers/parseYaml.worker";
import { use as useBulk } from "./controllers/bulk";
import { use as useInfo } from "./controllers/info";
import * as algorithm from "./controllers/algorithm";
import * as instance from "./controllers/instance";
import * as map from "./controllers/map";
import * as ongoingSubmission from "./controllers/ongoingSubmission";
import * as pipeline from "./controllers/pipeline";
import * as request from "./controllers/request";
import * as scenario from "./controllers/scenario";
import * as solutionPath from "./controllers/solutionPath";
import * as submission from "./controllers/submission";
import * as submissionKey from "./controllers/submissionKey";
import { createKeyAndSendMail } from "./controllers/user";
import { Request, SubmissionKey, User } from "./models";
import { use as useQueries } from "./query/queries";
import { express, expandOptionalPath, toElysiaPath } from "./elysia/expressAdapter";
import { mapRoutes } from "./elysia/routes/map";

const { hash } = password;

type AnyApp = Elysia<any, any, any, any, any, any, any>;
type Method = "get" | "post" | "delete" | "put" | "patch";

const jsonHeaders = {
  "access-control-allow-headers": "content-type, authorization",
  "access-control-allow-methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "access-control-allow-origin": "*",
};

const add = <T>(
  app: AnyApp,
  method: Method,
  base: string,
  path: string,
  ...handlers: Parameters<typeof express<T>> extends [string, ...infer R]
    ? R
    : never
) => {
  for (const expandedPath of expandOptionalPath(path)) {
    const fullPath = `${base}${toElysiaPath(expandedPath)}`;
    (app[method] as any)(
      fullPath,
      express<T>(fullPath, ...(handlers as any)),
    );
  }
};

const addBasic = (app: AnyApp, base: string, model: Model<any>) => {
  const auth = passport.authenticate("jwt", { session: false });

  add(app, "get", base, "/", auth, async (_, res) => {
    res.json(await model.find());
  });
  add(app, "get", base, "/:id", auth, async (req, res) => {
    res.json(await model.findById(req.params.id));
  });
  add(app, "post", base, "/write", auth, async (req, res) => {
    const { id, data } = req.body;
    const result = await model.findOneAndUpdate(
      { _id: id ?? new Types.ObjectId() },
      { $set: data },
      { upsert: true },
    );
    res.json({ id: result?.id?.toString?.() });
  });
  add(app, "post", base, "/delete", auth, async (req, res) => {
    const { id } = req.body;
    await model.findByIdAndDelete(id);
    res.json({ id });
  });
};

const addUserBasic = (app: AnyApp) => {
  const auth = passport.authenticate("jwt", { session: false });
  const base = "/api/user/basic";

  add(app, "get", base, "/", auth, async (_, res) => {
    res.json(await User.find());
  });
  add(app, "get", base, "/:id", auth, async (req, res) => {
    res.json(await User.findById(req.params.id));
  });
  add(app, "post", base, "/write", auth, async (req, res) => {
    const { username, password, id } = req.body;
    const result = await User.findOneAndUpdate(
      { _id: id ?? new Types.ObjectId() },
      { $set: { username, hash: await hash(password) } },
      { upsert: true },
    );
    res.json({ id: result?.id?.toString?.() });
  });
  add(app, "post", base, "/delete", auth, async (req, res) => {
    const { id } = req.body;
    await User.findByIdAndDelete(id);
    res.json({ id });
  });
};

const mountExpressUse = (app: AnyApp) => {
  const compat = {
    use(path: string, ...handlers: any[]) {
      const router = handlers.pop();
      const stack = router?.stack ?? [];

      for (const layer of stack) {
        if (layer.name === "router" && layer.handle?.stack) {
          const prefix =
            layer.regexp
              ?.toString()
              ?.match(/\\\/([^\\]+)\\\/\?\(\?=\\\/\|\$\)/)?.[1]
              ?.replace(/\\\//g, "/") ?? "";

          for (const nestedLayer of layer.handle.stack) {
            const route = nestedLayer.route;
            if (!route) continue;

            const routeHandlers = route.stack.map((item: any) => item.handle);
            const methods = Object.keys(route.methods) as Method[];
            for (const method of methods) {
              add(
                app,
                method,
                path,
                `/${prefix}${route.path}`,
                ...handlers,
                ...routeHandlers,
              );
            }
          }
          continue;
        }

        const route = layer.route;
        if (!route) continue;

        const routeHandlers = route.stack.map((item: any) => item.handle);
        const methods = Object.keys(route.methods) as Method[];
        for (const method of methods) {
          add(app, method, path, route.path, ...handlers, ...routeHandlers);
        }
      }
    },
  };

  useQueries(compat as any);
  useAuth(compat as any);
  useBulk(compat as any);
  useInfo(compat as any);
};

export const createElysiaApp = () => {
  configurePassport();

  const app = new Elysia()
    .headers(jsonHeaders)
    .options("*", ({ set }) => {
      set.status = 204;
      return undefined;
    })
    .onParse(async (context: any, contentType) => {
      const text = () => context.request.text();
      if (contentType?.includes("application/yaml")) {
        return parseYamlAsync(await text());
      }
      if (contentType?.includes("application/json")) {
        return parseYamlAsync(await text());
      }
      if (contentType?.includes("text/csv")) {
        return parseCsvAsync(await text());
      }
      if (contentType?.includes("application/x-www-form-urlencoded")) {
        return Object.fromEntries(new URLSearchParams(await text()));
      }
      if (contentType?.includes("text/")) {
        return text();
      }
    })
    .get("/", () => process.env.APP_NAME ?? "mapf-tracker-api")
    .get("/api/heartbeat", () => "OK")
    .get("/res/*", ({ params, status }) => {
      const resource = params["*"];
      if (!resource || resource.includes("..")) return status(404, "Not found");
      return Bun.file(`${import.meta.dir}/resources/${resource}`);
    })
    // Native Elysia routes are chained into the app definition (not added via
    // `add`, whose return value is discarded) so their types flow into the
    // exported `App` type for end-to-end Eden inference.
    .use(mapRoutes);

  add(app, "post", "/api/map", "/preview", map.preview);
  add(app, "post", "/api/map", "/makespan", map.makespan);

  add(app, "get", "/api/instance", "/", instance.findAll);
  add(app, "get", "/api/instance", "/:id", instance.findNonEmptyByScenId);
  add(app, "get", "/api/instance", "/id/:id", instance.findById);
  add(app, "get", "/api/instance", "/getAlgo/:id", instance.findAlgosRecord);
  add(app, "get", "/api/instance", "/DownloadRow/:id", instance.downloadRowById);
  add(app, "get", "/api/instance", "/DownloadInstance/:id", instance.downloadNonEmptyByScenId);
  add(app, "get", "/api/instance", "/DownloadMapByID/:id", instance.downloadMapByID);
  add(app, "get", "/api/instance", "/test/:id", instance.get_map_level_summary);

  add(app, "get", "/api/submission", "/summary/:algorithm", submission.summaryByAlgorithm);
  add(app, "get", "/api/submission", "/:algorithm/:scenario", submission.byScenario);

  add(app, "get", "/api/scenario", "/", scenario.findAll);
  add(app, "get", "/api/scenario", "/map/:id", scenario.findByMap_id);
  add(app, "get", "/api/scenario", "/map/:id/:scen_type", scenario.findByMap_id_Map_type);
  add(app, "get", "/api/scenario", "/:id", scenario.findById);
  add(app, "get", "/api/scenario", "/id/:id", scenario.findById);

  add(app, "get", "/api/algorithm", "/", algorithm.findAll);
  add(app, "get", "/api/algorithm", "/all_detail", algorithm.findAllDetails);
  add(app, "get", "/api/algorithm", "/getClosedInfo/", algorithm.findBestClosed);
  add(app, "get", "/api/algorithm", "/getLowerInfo/", algorithm.findBestLower);
  add(app, "get", "/api/algorithm", "/getSolutionInfo/", algorithm.findBestSolution);
  add(app, "get", "/api/algorithm", "/getSolvedInfo/", algorithm.findBestSolved);
  add(app, "get", "/api/algorithm", "/test", algorithm.findBestLowerDomainQuery);
  add(app, "get", "/api/algorithm", "/getDomainClosedInfo", algorithm.findClosedDomainQuery);
  add(app, "get", "/api/algorithm", "/getDomainSolvedInfo", algorithm.findSolvedDomainQuery);
  add(app, "get", "/api/algorithm", "/getDomainLowerInfo", algorithm.findBestLowerDomainQuery);
  add(app, "get", "/api/algorithm", "/getDomainSolutionInfo", algorithm.findBestSolutionDomainQuery);
  add(app, "get", "/api/algorithm", "/getScenClosedInfo/:id", algorithm.findScenBestClosed);
  add(app, "get", "/api/algorithm", "/getScenSolvedInfo/:id", algorithm.findScenBestSolved);
  add(app, "get", "/api/algorithm", "/getScenLowerInfo/:id", algorithm.findScenBestLower);
  add(app, "get", "/api/algorithm", "/getScenSolutionInfo/:id", algorithm.findScenBestSolution);
  add(app, "get", "/api/algorithm", "/getAgentClosedInfo/:id", algorithm.findAgentBestClosed);
  add(app, "get", "/api/algorithm", "/getAgentSolvedInfo/:id", algorithm.findAgentBestSolved);
  add(app, "get", "/api/algorithm", "/getAgentLowerInfo/:id", algorithm.findAgentBestLower);
  add(app, "get", "/api/algorithm", "/getAgentSolutionInfo/:id", algorithm.findAgentBestSolution);
  add(app, "get", "/api/algorithm", "/getAgentSolutionCost/:mapId&:scenId", algorithm.findAgentSolutionCost);
  add(app, "get", "/api/algorithm", "/getAgentLower/:mapId&:scenId", algorithm.findAgentLower);

  add(app, "get", "/api/solution_path", "/:source/:id", solutionPath.findPath);

  add(app, "get", "/api/request", "/", authenticate, request.findAll);
  add(app, "get", "/api/request", "/key/:key", request.findByKey);
  add(app, "get", "/api/request", "/id/:id", request.findByInstance_id);
  add(app, "post", "/api/request", "/create", request.create);
  add(app, "post", "/api/request", "/update/:id", request.updateRequest);
  add(app, "post", "/api/request", "/updateElevated/:id", authenticate, request.updateRequestElevated);
  add(app, "get", "/api/request", "/email/:email", request.findByEmail);

  addBasic(app, "/api/request/basic", Request);

  add(app, "get", "/api/submission_key", "/", submissionKey.findAll);
  add(app, "get", "/api/submission_key", "/:apiKey", submissionKey.findByApiKey);
  add(app, "post", "/api/submission_key", "/create/:request", passport.authenticate("jwt", { session: false }), submissionKey.create);
  addBasic(app, "/api/submission_key/basic", SubmissionKey as any);

  add(app, "post", "/api/user", "/notify", authenticate, createKeyAndSendMail);
  addUserBasic(app);

  add(app, "get", "/api/ongoing_submission", "/", ongoingSubmission.findAll);
  add(app, "get", "/api/ongoing_submission", "/id/:id", ongoingSubmission.findById);
  add(app, "post", "/api/ongoing_submission", "/delete", ongoingSubmission.deleteById);
  add(app, "get", "/api/ongoing_submission", "/status/:apiKey", ongoingSubmission.statusByApiKey);
  add(app, "delete", "/api/ongoing_submission", "/:apiKey", ongoingSubmission.deleteByApiKey);
  add(app, "get", "/api/ongoing_submission", "/summary-pagecount/:apiKey", ongoingSubmission.summaryPageCountByApiKeyGeneral);
  add(app, "get", "/api/ongoing_submission", "/summary/:apiKey/:page?", ongoingSubmission.summaryByApiKey);
  add(app, "get", "/api/ongoing_submission", "/:apiKey", ongoingSubmission.summaryByApiKeyGeneral);
  add(app, "get", "/api/ongoing_submission", "/scenario/:apiKey/:scenario", ongoingSubmission.findByScenario);
  add(app, "get", "/api/ongoing_submission", "/finalise/:key", ongoingSubmission.finalise);
  add(app, "post", "/api/ongoing_submission", "/create/:apiKey/:label?", ongoingSubmission.create);
  add(app, "post", "/api/ongoing_submission", "/status", ongoingSubmission.status);

  add(app, "get", "/api/pipeline", "/status", authenticate, pipeline.getStatus);
  add(app, "get", "/api/pipeline", "/run/:stage", authenticate, pipeline.runStage(false));
  add(app, "get", "/api/pipeline", "/runOne/:stage", authenticate, pipeline.runStage(true));

  mountExpressUse(app);

  return app.get("*", () => "Not found");
};

export const app = createElysiaApp();

export type App = typeof app;

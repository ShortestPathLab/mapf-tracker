import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { ZodError } from "zod";
import { serializeError } from "serialize-error";
import { log } from "./logging";
import { parseCsvAsync } from "./body-parsers/parseCsv.worker";
import { parseYamlAsync } from "./body-parsers/parseYaml.worker";
import { authRoutes } from "auth";
import { algorithmRoutes } from "./elysia/routes/algorithm";
import { bulkRoutes } from "./elysia/routes/bulk";
import { infoRoutes } from "./elysia/routes/info";
import { instanceRoutes } from "./elysia/routes/instance";
import { mapRoutes } from "./elysia/routes/map";
import { ongoingSubmissionRoutes } from "./elysia/routes/ongoingSubmission";
import { pipelineRoutes } from "./elysia/routes/pipeline";
import { queriesRoutes } from "./elysia/routes/queries";
import { requestRoutes } from "./elysia/routes/request";
import { scenarioRoutes } from "./elysia/routes/scenario";
import { solutionPathRoutes } from "./elysia/routes/solutionPath";
import { submissionRoutes } from "./elysia/routes/submission";
import { submissionKeyRoutes } from "./elysia/routes/submissionKey";
import { userRoutes } from "./elysia/routes/user";

const jsonHeaders = {
  "access-control-allow-headers": "content-type, authorization",
  "access-control-allow-methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "access-control-allow-origin": "*",
};

export const createElysiaApp = () => {
  const app = new Elysia()
    .headers(jsonHeaders)
    .options("*", ({ set }) => {
      set.status = 204;
      return undefined;
    })
    // Unhandled errors become 500s; zod validation failures become 400s.
    .onError(({ code, error, set }) => {
      if (error instanceof ZodError) {
        set.status = 400;
        return error.format();
      }
      if (code === "NOT_FOUND") {
        set.status = 404;
        return "Not found";
      }
      set.status = 500;
      log.error("Request error", {
        message: error instanceof Error ? error.message : String(error),
      });
      return {
        error: "Error occurred processing this request.",
        details: serializeError(error),
      };
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
    .use(swagger())
    .get("/", () => process.env.APP_NAME ?? "mapf-tracker-api")
    .get("/api/heartbeat", () => "OK")
    .get("/res/*", ({ params, status }) => {
      const resource = params["*"];
      if (!resource || resource.includes("..")) return status(404, "Not found");
      return Bun.file(`${import.meta.dir}/resources/${resource}`);
    })
    .use(authRoutes)
    .use(mapRoutes)
    .use(scenarioRoutes)
    .use(instanceRoutes)
    .use(submissionRoutes)
    .use(algorithmRoutes)
    .use(solutionPathRoutes)
    .use(requestRoutes)
    .use(submissionKeyRoutes)
    .use(userRoutes)
    .use(ongoingSubmissionRoutes)
    .use(pipelineRoutes)
    .use(queriesRoutes)
    .use(bulkRoutes)
    .use(infoRoutes)
    .get("*", () => "Not found");

  return app;
};

export const app = createElysiaApp();

export type App = typeof app;

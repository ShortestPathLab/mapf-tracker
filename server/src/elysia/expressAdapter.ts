import type { Context } from "elysia";
import type { NextFunction } from "express";

type Params = Record<string, string | undefined>;
type Headers = Record<string, string>;
type Method = "get" | "post" | "delete" | "put" | "patch";

export type ExpressRoute = {
  method: Method;
  path: string;
  handlers: ExpressHandler[];
};

type ExpressHandler = (req: any, res: any, next: NextFunction) => any;

type CapturedResponse = {
  body: unknown;
  finished: boolean;
  headers: Headers;
  status: number;
};

const defaultStatus = 200;

const splitPath = (path: string) => path.split("/").filter(Boolean);

const cleanParamName = (name: string) => name.replace(/\?$/, "");

export const toElysiaPath = (path: string) =>
  splitPath(path)
    .map((segment) => {
      if (!segment.includes(":")) return segment;
      if (segment.includes("&:")) {
        const names = segment
          .split("&")
          .map((part) => cleanParamName(part.replace(/^:/, "")));
        return `:${names.join("And")}`;
      }
      return segment.replace(/\?$/, "");
    })
    .join("/")
    .replace(/^/, "/");

export const expandOptionalPath = (path: string) => {
  if (!path.includes("?")) return [path];

  const required = splitPath(path)
    .filter((segment) => !segment.endsWith("?"))
    .join("/");

  return [`/${required}`, path.replace(/\?/g, "")];
};

export const parseExpressParams = (pattern: string, url: string): Params => {
  const params: Params = {};
  const pathSegments = splitPath(new URL(url).pathname);
  const patternSegments = splitPath(pattern);

  patternSegments.forEach((segment, index) => {
    if (!segment.includes(":")) return;
    const value = pathSegments[index];
    if (!value) return;

    if (segment.includes("&:")) {
      const names = segment
        .split("&")
        .map((part) => cleanParamName(part.replace(/^:/, "")));
      const values = value.split("&");
      names.forEach((name, valueIndex) => {
        params[name] = values[valueIndex];
      });
      return;
    }

    params[cleanParamName(segment.replace(/^:/, ""))] = value;
  });

  return params;
};

const appendQuery = (url: string) => {
  const entries = new URL(url).searchParams.entries();
  return Object.fromEntries(entries);
};

const createExpressRequest = (
  context: Context,
  pattern: string,
  body: unknown,
) => {
  const headers = Object.fromEntries(context.request.headers.entries());

  // Passport calls req.logIn(user, options?, done) / req.logOut(options?, done),
  // so the callback is always the final argument regardless of arity.
  const callDone = (args: unknown[]) => {
    const done = args[args.length - 1];
    if (typeof done === "function") (done as (error?: unknown) => void)();
  };

  const req: any = {
    body,
    headers,
    method: context.request.method,
    params: parseExpressParams(pattern, context.request.url),
    query: appendQuery(context.request.url),
    url: new URL(context.request.url).pathname,
    get: (name: string) => context.request.headers.get(name),
    header: (name: string) => context.request.headers.get(name),
    is: (type: string) =>
      context.request.headers.get("content-type")?.includes(type) ?? false,
  };

  req.logIn = req.login = (user: unknown, ...rest: unknown[]) => {
    req.user = user;
    callDone(rest);
  };
  req.logOut = req.logout = (...rest: unknown[]) => {
    req.user = undefined;
    callDone(rest);
  };
  req.isAuthenticated = () => Boolean(req.user);
  req.isUnauthenticated = () => !req.user;

  return req;
};

const createExpressResponse = (
  context: Context,
  captured: CapturedResponse,
  resolve: () => void,
) => {
  const res = {
    locals: {},
    get statusCode() {
      return captured.status;
    },
    set statusCode(code: number) {
      captured.status = code;
    },
    status(code: number) {
      captured.status = code;
      return this;
    },
    json(body: unknown) {
      captured.headers["content-type"] = "application/json; charset=utf-8";
      captured.body = body;
      captured.finished = true;
      resolve();
      return this;
    },
    send(body: unknown) {
      captured.body = body;
      captured.finished = true;
      resolve();
      return this;
    },
    end(body?: unknown) {
      captured.body = body;
      captured.finished = true;
      resolve();
      return this;
    },
    setHeader(name: string, value: string | number | readonly string[]) {
      captured.headers[name.toLowerCase()] = Array.isArray(value)
        ? value.join(", ")
        : `${value}`;
      return this;
    },
    set(name: string, value: string | number | readonly string[]) {
      return this.setHeader(name, value);
    },
    header(name: string, value: string | number | readonly string[]) {
      return this.setHeader(name, value);
    },
    getHeader(name: string) {
      return captured.headers[name.toLowerCase()];
    },
    removeHeader(name: string) {
      delete captured.headers[name.toLowerCase()];
      return this;
    },
  };

  context.set.status = captured.status;
  return res;
};

export const express =
  <T = unknown>(pattern: string, ...handlers: ExpressHandler[]) =>
  async (context: Context): Promise<T> => {
    const captured: CapturedResponse = {
      body: undefined,
      finished: false,
      headers: {},
      status: defaultStatus,
    };

    // Reassigned per step so the response object can settle the current step
    // when a handler ends the response (res.json/send/end).
    let notifyFinished: () => void = () => {};
    const res = createExpressResponse(context, captured, () => notifyFinished());
    const req = createExpressRequest(context, pattern, context.body);

    // Walk the Express middleware chain. A step advances only when the handler
    // calls next(), and stops when a handler ends the response. We settle on
    // those signals rather than on the handler's return value, because Express
    // middleware (e.g. Passport) may return synchronously yet call next()/end
    // the response asynchronously.
    for (const handler of handlers) {
      if (captured.finished) break;

      const advanced = await new Promise<boolean>((resolve, reject) => {
        let settled = false;
        const settle = (value: boolean) => {
          if (settled) return;
          settled = true;
          resolve(value);
        };

        notifyFinished = () => settle(false);

        const next: NextFunction = (error?: unknown) => {
          if (error) {
            if (!settled) {
              settled = true;
              reject(error);
            }
            return;
          }
          settle(true);
        };

        Promise.resolve(handler(req as any, res as any, next)).catch((error) => {
          if (!settled) {
            settled = true;
            reject(error);
          }
        });
      });

      if (!advanced) break;
    }

    notifyFinished = () => {};

    context.set.status = captured.status;
    Object.assign(context.set.headers, captured.headers);

    // Express's res.json/res.send serialise objects as JSON, but Elysia renders
    // a bare class instance (e.g. a single Mongoose document) as text/plain via
    // its inspect string. Normalise non-plain objects to a plain JSON value so
    // single-document responses serialise correctly (toJSON also adds `id`).
    // Arrays and plain objects already serialise as JSON and pass through.
    const body = captured.body;
    if (
      body !== null &&
      typeof body === "object" &&
      !Array.isArray(body) &&
      (body as object).constructor !== Object
    ) {
      const toJSON = (body as { toJSON?: () => unknown }).toJSON;
      return (
        typeof toJSON === "function"
          ? toJSON.call(body)
          : JSON.parse(JSON.stringify(body))
      ) as T;
    }

    return captured.body as T;
  };

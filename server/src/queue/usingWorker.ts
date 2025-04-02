import { randomUUIDv7 } from "bun";
import { once } from "lodash";
import { log } from "logging";

type WorkerConstructor = () => Worker;

export const usingWorkerReusable = <R>(w: WorkerConstructor) => {
  const getWorker = once(w);
  return (f: (w: Worker) => Promise<R>) => f(getWorker());
};

export const usingWorker =
  <R>(w: WorkerConstructor) =>
  async (task: (w: Worker) => Promise<R>) => {
    const worker = w();
    const out = await task(worker);
    worker.terminate();
    return out;
  };

const createWorkerTaskFunction =
  (u = usingWorker) =>
  <T, R>(w: WorkerConstructor) => {
    const usingW = once(() => u<R>(w));
    return (inp: T) =>
      usingW()(
        (worker) =>
          new Promise<R>((res, rej) => {
            const id = randomUUIDv7();
            worker.postMessage({ data: inp, id });
            const f = (out: MessageEvent<MessageHandlerResult<R>>) => {
              if (out.data.id === id) {
                worker.removeEventListener("message", f);
                if (out.data.status === "success") res(out.data.result);
                else rej(out.data.error);
              }
            };
            worker.addEventListener("message", f);
            worker.addEventListener("error", (e) => {
              log.error("Worker error", { message: e.message });
              console.error(e);
              // Do not reject on error, this listener listens to general worker errors, which may not indicate the current task failing.
              // Task fails should result in a message that looks like { error: ErrorMessage }.
            });
          })
      );
  };

export const usingWorkerTask = createWorkerTaskFunction(usingWorker);

export const usingWorkerTaskReusable =
  createWorkerTaskFunction(usingWorkerReusable);

type MessageHandlerResult<U> =
  | { status: "success"; result: U; id: string }
  | { status: "error"; error: any; id: string };

export const usingTaskMessageHandler =
  <T, U>(f: (a: T) => Promise<U>) =>
  async (m: MessageEvent<{ id: string; data: T }>) => {
    try {
      const output = await f(m.data.data);
      postMessage({ status: "success", result: output, id: m.data.id });
    } catch (e) {
      postMessage({ status: "error", error: e, id: m.data.id });
    }
  };
